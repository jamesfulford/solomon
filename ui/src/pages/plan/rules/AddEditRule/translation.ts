import RRule, { Options } from "rrule";
import { IFlags } from "../../../../store/reducers/flags";
import { IApiRuleMutate } from "../IRule";
import { extractHebrew } from "./hebrew";
import { ONCE, SupportedFrequency, WorkingState, YEARLY_HEBREW } from "./types";


function workingStateRRuleToString(rrule: WorkingState['rrule']): string {
    // serializing rrule for sending from UI to API.
    // inverse of stringToWorkingStateRRule

    if (rrule.freq === YEARLY_HEBREW) {
        return `X-YEARLY-HEBREW: ${rrule.byhebrewmonth || 1}, ${rrule.byhebrewday || 1}`;
    }

    if (rrule.freq === ONCE) {
        return new RRule({
            freq: RRule.YEARLY,
            count: 1,
            dtstart: rrule.dtstart ? new Date(rrule.dtstart) : undefined,
        }).toString();
    }
    
    // at this point it isn't "ONCE"
    const freq = rrule.freq as Options["freq"];

    let rruleOptions = {
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
    
    // Override what might be in `rrule`
    delete rruleOptions['byhebrewmonth']
    delete rruleOptions['byhebrewday']

    return new RRule(rruleOptions).toString();
}

function stringToWorkingStateRRule(rrulestring: string): WorkingState['rrule'] {
    // inverse of workingStateRRuleToString, for editing

    const hebrewExtraction = extractHebrew(rrulestring);
    if (hebrewExtraction) {
        return {
            freq: YEARLY_HEBREW,
            ...hebrewExtraction,
        }
    }
    
    const rrule = RRule.fromString(rrulestring);
    const libraryInferredOptions = rrule.options;
    const parsedOptions = rrule.origOptions;
    parsedOptions.freq = Number(parsedOptions.freq);

    if (![
        RRule.YEARLY,
        RRule.MONTHLY,
        RRule.WEEKLY,
        undefined,
    ].includes(parsedOptions.freq)) {
        throw new Error("Unsupported frequency specified in rule: " + rrulestring);
    }

    const freq = parsedOptions.freq as SupportedFrequency;

    const dtstart = parsedOptions.dtstart?.toISOString().split("T")[0];
    const until = parsedOptions.until?.toISOString().split("T")[0];
    return {
        ...parsedOptions,
        freq: libraryInferredOptions.count === 1 ? ONCE : freq,

        dtstart,
        until,
    };
}


export function convertWorkingStateToApiRuleMutate(fields: WorkingState, flags?: IFlags): IApiRuleMutate {

    const labels = { ...fields.labels };
    if (flags?.highLowEnabled) {
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

        // byhebrewmonth: 1,
        // byhebrewday: 1,
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
