import { IApiRuleMutate } from '../IRule';
import RRule, { Options } from 'rrule';


export const ONCE = 'ONCE';
export const YEARLY_HEBREW = 'YEARLY-HEBREW';

type SupportedFrequency = typeof RRule.YEARLY |
    typeof RRule.MONTHLY |
    typeof RRule.WEEKLY |
    typeof ONCE |
    typeof YEARLY_HEBREW;

export type WorkingState = Omit<
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
        freq: SupportedFrequency;

        dtstart?: string;
        until?: string;
    }>,
    value: string,

    // working state needed in submission
    lowvalue: string,
    highvalue: string,
};
