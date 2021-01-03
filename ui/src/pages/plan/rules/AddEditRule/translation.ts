import RRule, { Options } from "rrule";
import { IApiRuleMutate } from "../IRule";
import { ONCE, WorkingState } from "./types";


function workingStateRRuleToString(rrule: WorkingState['rrule']): string {
    // normally goes to RRule package, but:
    // - freq === "ONCE"
    // - dtstart and until translate

    // - TODO: yearly hebrew

    if (rrule.freq === ONCE) {
        return new RRule({
            freq: RRule.YEARLY,
            count: 1,
            dtstart: rrule.dtstart ? new Date(rrule.dtstart) : undefined,
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
        byweekday: freq === RRule.WEEKLY ? rrule.byweekday : undefined,

        count: undefined,
        wkst: undefined,
        bymonth: undefined,
        byhour: undefined,
        byminute: undefined,
        bysecond: undefined,
        byweekno: undefined,
        byeaster: undefined,
    };

    return new RRule(rruleOptions).toString();
}

function stringToWorkingStateRRule(rrulestring: string): WorkingState['rrule'] {
    // inverse of workingStateRRuleToString, for editing
    
    const rrule = RRule.fromString(rrulestring);
    const libraryInferredOptions = rrule.options;
    const parsedOptions = rrule.origOptions;


    if (![
        RRule.YEARLY,
        RRule.MONTHLY,
        RRule.WEEKLY,
    ].includes(Number(parsedOptions.freq))) {
        throw new Error("Unsupported frequency specified in rule: " + rrulestring);
    }

    const dtstart = parsedOptions.dtstart?.toISOString().split("T")[0];
    const until = parsedOptions.until?.toISOString().split("T")[0];
    return {
        ...parsedOptions,
        freq: libraryInferredOptions.count === 1 ? ONCE : parsedOptions.freq,

        dtstart,
        until,
    };
}


export function convertWorkingStateToApiRuleMutate(fields: WorkingState, flags: { isHighLowEnabled?: boolean }): IApiRuleMutate {

    const labels = { ...fields.labels };
    if (flags.isHighLowEnabled) {
        labels.uncertainty = Boolean(fields.lowvalue || fields.highvalue);
        if (labels.uncertainty) {
            labels.highUncertainty = fields.highvalue ? Number(fields.highvalue) : Number(fields.value);
            labels.lowUncertainty = fields.lowvalue ? Number(fields.lowvalue) : Number(fields.value);
        }
    }

    return {
        name: fields.name,
        value: Number(fields.value),

        rrule: workingStateRRuleToString(fields.rrule),

        labels,
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

export function ruleToWorkingState(rule?: IApiRuleMutate): WorkingState {
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
