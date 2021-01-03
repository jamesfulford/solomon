import React from 'react';
import RRule from 'rrule';
import { Currency } from '../../../../components/currency/Currency';
import { IApiRuleMutate } from '../IRule';


export function RulePreview({ rule }: { rule: IApiRuleMutate | undefined }) {
    let rrule: RRule | undefined;
    try {
        rrule = rule?.rrule ? RRule.fromString(rule?.rrule) : undefined;
    } catch {
        console.warn("Unable to parse rrule from string ", rule?.rrule);
    }
    const value = rule?.value;

    const isOnce = rrule?.origOptions.count === 1;
    let message = '';
    if (isOnce) {
        message = 'once'
        if (rrule) {
            message = `once on ${rrule.all()[0].toISOString().split('T')[0]}`;
        }
    } else {
        if (rrule) {
            message = rrule.toText();
        } else {
            message = '...';
        }
    }

    return <div>
        <p className="m-0">
            {(value && Number.isFinite(value)) ? <Currency value={value} /> : 'Occurs'} {message}
        </p>

        {(!isOnce && rrule) && (() => {
            // Next 2 days
            const [next, oneAfter] = rrule.all((d, index) => index <= 1)
                .map(d => d.toISOString().split("T")[0]);
            
            return <p className="m-0">Next is {next}{oneAfter && `, then ${oneAfter}`}</p>
        })()}
    </div>
}