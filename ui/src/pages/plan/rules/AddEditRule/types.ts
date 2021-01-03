import { IApiRuleMutate } from '../IRule';
import { Options } from 'rrule';


export const ONCE = 'ONCE';
export const YEARLY_HEBREW = 'YEARLY-HEBREW';

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
        freq: Options['freq'] | typeof ONCE | typeof YEARLY_HEBREW;

        dtstart?: string;
        until?: string;
    }>,
    value: string,

    // working state needed in submission
    lowvalue: string,
    highvalue: string,
};
