import React, { useCallback } from 'react';
import './Rule.css';
import { Currency } from '../../../../components/currency/Currency';
import { getPreviewDetails } from '../AddEditRule/RulePreview';
import { IApiRule } from '../../../../services/RulesService';


function getRRuleDisplayString(rruleString: string): string {
    try {
        const { message } = getPreviewDetails(rruleString);
        if (!message) {
            throw new Error(message);
        }
        return message;
    } catch (e) {
        return "(Oops, looks like an invalid recurrence rule)"
    }
}

export interface RuleProps {
    rule: IApiRule,
    onClick?: (id: string, rule: IApiRule) => void,
    selected: boolean
}

export const Rule = ({
    rule,
    onClick: showModal = () => {},
    selected,
}: RuleProps) => {
    const editButtonHandler = useCallback(() => showModal(rule.id, rule), [rule, showModal])
    const rruleString = getRRuleDisplayString(rule.rrule);
    return <div className={`ruledescription p-2 ${selected ? 'ruledescription-selected' : ''}`} onClick={editButtonHandler}>
        <div className="btn-toolbar justify-content-between" role="toolbar" aria-label="Toolbar with button groups">
            <div className="btn-group mr-2" role="group" aria-label="First group">
                <div className="rulename">
                    <h5 className="m-0" title={rule.name}>{rule.name}</h5>
                </div>
            </div>

            <div className="btn-group mr-2" role="group" aria-label="Second group">
                <Currency value={rule.value} />
            </div>
        </div>
        <p className="m-0">{rruleString}</p>
    </div>;
}
