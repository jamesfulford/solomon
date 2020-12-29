import React, { useState } from 'react';
import RRule, { ByWeekday, Options } from 'rrule';
import { IApiRuleMutate } from './IRule';
import './AddEditRule.css'
import { Field, FieldArray, FieldProps, Form, Formik } from 'formik';


type WorkingState = Omit<
    Omit<
        IApiRuleMutate,
        'rrule'
    >, 
    'value'
> & {
    // omit overrides
    rrule: Partial<
        Omit<Omit<Omit<
            Options,
            'freq'>,
            'dtstart'>,
            'until'> 
        & {
        freq: Options['freq'] | 'ONCE';

        dtstart?: string;
        until?: string;
    }>,
    value: string,

    // working state needed in submission
    lowvalue: string,
    highvalue: string,
};

function workingStateRRuleToString(rrule: WorkingState['rrule']): string {
    // normally goes to RRule package, but:
    // - freq === "ONCE"
    // - dtstart and until translate

    // - TODO: yearly hebrew

    if (rrule.freq === "ONCE") {
        if (!rrule.dtstart) throw new Error('Start date is required'); // should never happen, enforced by UI `required` attribute
        return new RRule({
            freq: RRule.YEARLY,
            count: 1,
            dtstart: new Date(rrule.dtstart),
        }).toString();
    }
    
    // at this point it isn't "ONCE"
    const freq = Number(rrule.freq) as Options["freq"];

    const rruleOptions = {
        ...rrule,
        freq,
        dtstart: rrule.dtstart ? new Date(rrule.dtstart) : undefined,
        until: rrule.until ? new Date(rrule.until) : undefined,
        bymonthday: freq === RRule.MONTHLY ? rrule.bymonthday : undefined,
    };

    return new RRule(rruleOptions).toString();
}

function stringToWorkingStateRRule(rrulestring: string): WorkingState['rrule'] {
    // inverse of workingStateRRuleToString, for editing
    
    const parsedOptions = RRule.fromString(rrulestring).options;
    const dtstart = parsedOptions.dtstart?.toISOString().split("T")[0];
    const until = parsedOptions.until?.toISOString().split("T")[0];
    return {
        ...parsedOptions,
        // TODO: change UI listing to have same logic
        freq: parsedOptions.count === 1 ? 'ONCE' : parsedOptions.freq,

        dtstart,
        until,
    };
}


function convertWorkingStateToApiRuleMutate(fields: WorkingState, flags: any): IApiRuleMutate {

    return {
        name: fields.name,
        value: Number(fields.value),

        rrule: workingStateRRuleToString(fields.rrule),

        labels: flags.isHighLowEnabled ? {
            ...fields.labels,
            'uncertainty': fields.lowvalue || fields.highvalue,
            'highUncertainty': fields.highvalue ? Number(fields.highvalue) : Number(fields.value),
            'lowUncertainty': fields.lowvalue ? Number(fields.lowvalue) : Number(fields.value),
        }: fields.labels,
    };
}

const defaultValues: WorkingState = {
    rrule: {
        freq: RRule.MONTHLY,
        bymonthday: 1,
        interval: 1,
        dtstart: '',
        until: '',
    },

    lowvalue: '',
    value: '', // input=number is a pain for users
    highvalue: '',

    name: '',
    labels: {},
};

function ruleToWorkingState(rule?: IApiRuleMutate) {
    if (!rule) {
        return defaultValues;
    }

    return {
        rrule: stringToWorkingStateRRule(rule.rrule),
        name: rule.name,
        labels: rule.labels,
        value: String(rule.value),

        lowvalue: String(rule?.labels?.lowUncertainty || ''),
        highvalue: String(rule?.labels?.highUncertainty || ''),
    }
}

export const AddEditRule = ({
    onCreate,
    onUpdate,
    onDelete,
    flags = {},
    rule
}: {
    onCreate: (rule: IApiRuleMutate) => Promise<void>,
    onUpdate: (rule: IApiRuleMutate) => Promise<void>,
    onDelete: () => Promise<void>,
    flags?: { isHighLowEnabled?: boolean },
    rule?: IApiRuleMutate,
}) => {
    const [intentionToCopy, setIntentionToCopy] = useState(false);
    const canUpdate = Boolean(rule && "id" in rule);

    async function submit(fields: WorkingState, { setSubmitting }: any) {
        let final: IApiRuleMutate;
        try {
            final = convertWorkingStateToApiRuleMutate(fields, flags);
        } catch (e) {
            console.error(e)
            return;
        }

        if (!canUpdate || intentionToCopy) {
            await onCreate(final);
        } else {
            await onUpdate(final);
        }

        setSubmitting(false);
    }

    enum ValueInputMode {
        VALUE = 'VALUE',
        HIGH_MID_LOW = "HIGH_MID_LOW",
    }

    // TODO: fix editing for this, decide on good UX
    const [valueInputMode, setValueInputMode] = useState<ValueInputMode>(ValueInputMode.VALUE);

    const initialValues = ruleToWorkingState(rule);

    return <Formik initialValues={initialValues} onSubmit={submit}>
        {(props) => {
            const _freq = props.getFieldMeta('rrule.freq').value as WorkingState["rrule"]["freq"];
            const isOnce = _freq === "ONCE";
            // Sometimes its a string, sometimes its a number
            const freq = isOnce ? _freq : Number(_freq);

            const byweekday = (
                props.getFieldMeta('rrule.byweekday').value as WorkingState["rrule"]["byweekday"]
                || []) as ByWeekday[];
            
            const interval = props.getFieldMeta('rrule.interval').value as WorkingState["rrule"]["interval"] || 1;

            const currentRRule = new RRule(RRule.parseString(workingStateRRuleToString(props.getFieldMeta("rrule").value as WorkingState["rrule"])));

            return <Form>
                <div className="form-inline d-flex justify-content-between">

                    <Field name="name">
                        {({
                            field,
                        }: FieldProps) => <>
                            <label htmlFor="Name" className="sr-only">Rule name</label>
                            <input className="form-control form-control-sm" id="Name" placeholder="Rule name" type="text" {...field} />
                        </>}
                    </Field>

                    {valueInputMode === ValueInputMode.VALUE && <Field name="value">
                        {({
                            field,
                        }: FieldProps) => <>
                            <label htmlFor="Value" className="sr-only">Value</label>
                            <input className="form-control form-control-sm" id="Value" placeholder="Value $" type="text" pattern="-?[0-9]+\.?[0-9]{0,2}?" {...field} />
                        </>}
                    </Field>}

                    { flags.isHighLowEnabled && <div>
                        <button type="button" className="btn btn-link" onClick={() => setValueInputMode(x => {
                            // Toggle
                            return x === ValueInputMode.VALUE ? ValueInputMode.HIGH_MID_LOW : ValueInputMode.VALUE;
                        })}>I'm uncertain how much this will be</button>

                        {(valueInputMode === ValueInputMode.HIGH_MID_LOW) && <>
                            <Field name="lowvalue">
                                {({
                                    field,
                                }: FieldProps) => <>
                                    <label htmlFor="LowValue" className="sr-only">Bad (25%) Case Value</label>
                                    <input className="form-control form-control-sm" id="LowValue" placeholder="Bad (25%) Case Value $" type="text" pattern="-?[0-9]+\.?[0-9]{0,2}?" {...field} />
                                </>}
                            </Field>

                            <Field name="value">
                                {({
                                    field,
                                }: FieldProps) => <>
                                    <label htmlFor="Value" className="sr-only">Expected Case Value</label>
                                    <input className="form-control form-control-sm" id="Value" placeholder="Expected Case Value $" type="text" pattern="-?[0-9]+\.?[0-9]{0,2}?" {...field} />
                                </>}
                            </Field>

                            <Field name="highvalue">
                                {({
                                    field,
                                }: FieldProps) => <>
                                    <label htmlFor="HighValue" className="sr-only">Good (75%) Case Value</label>
                                    <input className="form-control form-control-sm" id="HighValue" placeholder="Good (75%) Case Value $" type="text" pattern="-?[0-9]+\.?[0-9]{0,2}?" {...field} />
                                </>}
                            </Field>
                        </>}
                    </div>}
                </div>
                
                {/* Recurrence-rule specific logics */}
                <div className="form-inline mt-2 d-flex justify-content-between">
                    <div>

                        <Field name="rrule.freq">
                            {({
                                field,
                            }: FieldProps) => <>
                                <label htmlFor="Frequency" className="sr-only">Frequency</label>   
                                <select className="form-control form-control-sm pl-1 pr-1" id="Frequency" {...field}>
                                    <option value={RRule.WEEKLY}>Week{interval > 1 && 's'}</option>
                                    <option value={RRule.MONTHLY}>Month</option>
                                    <option value={RRule.YEARLY}>Year</option>
                                    <option value={'ONCE'}>Once</option>
                                </select>
                            </>}
                        </Field>

                        {!isOnce && <Field name="rrule.interval">
                            {({
                                field,
                            }: FieldProps) => <>
                                <label htmlFor="Interval" className="sr-only">Interval</label>
                                <input className="form-control form-control-sm" style={{ width: 48 }} id="Interval" placeholder="Interval" type="number" min="1" {...field} />
                            </>}
                        </Field>}

                    </div>
                    
                    {/* Monthly day-of-month selector */}
                    {freq === RRule.MONTHLY && <Field name="rrule.bymonthday">
                        {({
                            field,
                        }: FieldProps) => <>
                            <label htmlFor="bymonthday" className="sr-only">Day of month</label>
                            <input className="form-control form-control-sm" id="bymonthday" placeholder="Day" style={{ width: 64 }}
                                type="number" min="1" max="31" required
                                {...field}
                                />
                        </>}
                    </Field>}


                    {(freq === RRule.WEEKLY) && <div role="group" className="btn-group" aria-label="Days of Week" data-testid="dayofweekcontrol">
                        <FieldArray name="rrule.byweekday">
                            {(arrayHelpers) => {
                                const days = [
                                    { rruleday: RRule.SU.weekday, displayday: "S" },
                                    { rruleday: RRule.MO.weekday, displayday: "M" },
                                    { rruleday: RRule.TU.weekday, displayday: "T" },
                                    { rruleday: RRule.WE.weekday, displayday: "W" },
                                    { rruleday: RRule.TH.weekday, displayday: "T" },
                                    { rruleday: RRule.FR.weekday, displayday: "F" },
                                    { rruleday: RRule.SA.weekday, displayday: "S" },
                                ];
                                return <>
                                    {days.map(({ rruleday, displayday }) => <button
                                        type="button"
                                        className={"btn btn-sm " + (byweekday.includes(rruleday) ? 'btn-primary' : 'btn-outline-primary')}
                                        data-dayofweek={rruleday}
                                        key={rruleday.toString()}
                                        onClick={e => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (byweekday.includes(rruleday)) {
                                                arrayHelpers.remove(byweekday.indexOf(rruleday));
                                            } else {
                                                arrayHelpers.push(rruleday);
                                            }
                                        }}>
                                        {displayday}
                                    </button>)}
                                </>
                            }}
                        </FieldArray>
                    </div>}
                </div>

                <div className="form-inline mt-2 d-flex justify-content-between">
                    {/* Start Date */}
                    <Field name="rrule.dtstart">
                        {({
                            field,
                        }: FieldProps) => <>
                            <label htmlFor="Start" className="sr-only">Start</label>
                            <input
                                className="form-control form-control-sm" placeholder="Start Date" id="Start"
                                type="date" required={
                                    (interval > 1) || isOnce || freq === RRule.YEARLY
                                }
                                style={{ width: 150 }}
                                {...field} />
                        </>}
                    </Field>

                    {/* End Date */}
                    {!isOnce && <Field name="rrule.until">
                        {({ field }: FieldProps) => <>
                            <label htmlFor="End" className="sr-only">End:</label>
                            <input
                                className="form-control form-control-sm" placeholder="End Date" id="End"
                                style={{ width: 150 }}
                                type="date" {...field} />
                        </>}
                    </Field>}
                </div>

                {/* Explaining input */}
                <div className="alert alert-light p-0 m-0 mt-1 text-center">
                    {(() => {
                        // Next 2 days
                        const [next, oneAfter] = currentRRule.all((d, index) => index <= 1)
                            .map(d => d.toISOString().split("T")[0]);
                        
                        return <p className="m-0">Next is {next}, then {oneAfter}.</p>
                    })()
                    }
                </div>
            
                {/* Submission / Actions */}
                <div className="d-flex flex-row-reverse justify-content-between">
                    <div className="d-flex flex-row-reverse align-items-center">
                        <button className="btn btn-outline-primary btn-sm mb-2 mt-2">{(!canUpdate || intentionToCopy) ? 'Create' : `Update ${rule?.name}`}</button>
                        {canUpdate && <>
                            <label className="mb-1 mr-3" htmlFor="intentionToCopy">Copy</label>
                            <input id="intentionToCopy" type="checkbox" className="mr-2" checked={intentionToCopy} onChange={e => setIntentionToCopy(e.target.checked)}></input>
                        </>}
                    </div>

                    {canUpdate && <button type="button" className="btn btn-outline-danger btn-sm mb-2 mt-2" onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}>Delete</button>}
                </div>
            </Form>
        }}
    </Formik>
}
