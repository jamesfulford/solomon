import React, { useCallback, useState } from 'react'
import { IApiRule, IApiRuleMutate } from './IRule';
import { Rule } from './Rule';
import useAxios from 'axios-hooks'
import axios from 'axios';
import sortBy from 'lodash/sortBy';
import Container from 'react-bootstrap/Container';
import { isHighLowEnabled } from '../../../flags';
import { AddEditRule } from './AddEditRule';


const baseUrl = process.env.REACT_APP_BASE_URL || '';

export const RulesContainer = ({ userid, onRefresh = () => {} }: { userid: string, onRefresh?: () => void }) => {
    const [{ data, loading, error }, refetch] = useAxios(
        `${baseUrl}/api/rules?userid=${userid}`
    );

    const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

    const triggerRefresh = useCallback(() => {
        refetch();
        onRefresh();
    }, [refetch, onRefresh])

    const createNewRule = useCallback((rule: IApiRuleMutate) => {
        return axios.post(`${baseUrl}/api/rules?userid=${userid}`, rule)
            .then((response) => {
                console.log('Created rule', response.data);
                triggerRefresh();
            });
    }, [triggerRefresh, userid]);

    const deleteHandler = useCallback((id: string) => {
        return axios.delete(`${baseUrl}/api/rules/${id}?userid=${userid}`)
            .then(() => {
                triggerRefresh();
            })
            .catch((e) => {
                // TODO: toast an error
                console.error('UHOH', e);
            })
    }, [triggerRefresh, userid]);

    const updateExistingRule = useCallback((id: string, rule: IApiRuleMutate) => {
        return axios.put(`${baseUrl}/api/rules/${id}?userid=${userid}`, rule)
            .then((response) => {
                console.log('Updated rule', response.data);
                triggerRefresh();
            })
            .catch((e) => {
                // TODO: toast an error
                console.error('UHOH', e);
            })
    }, [triggerRefresh, userid]);


    const onCreate = useCallback(async (rule: IApiRuleMutate) => {
        return createNewRule(rule);
    }, [createNewRule]);

    const onUpdate = useCallback(async (rule: IApiRuleMutate) => {
        if (!selectedRuleId) {
            console.warn("Attempted to update rule without rule selected. Ignoring. (this should never happen)");
            return;
        }
        return updateExistingRule(selectedRuleId, rule);
    }, [selectedRuleId, updateExistingRule]);

    const onDelete = useCallback(async () => {
        if (!selectedRuleId) {
            console.warn("Attempted to delete rule without rule selected. Ignoring. (this should never happen)");
            return;
        }
        return deleteHandler(selectedRuleId);
    }, [selectedRuleId, deleteHandler])

    const flags = { isHighLowEnabled: isHighLowEnabled(userid) };

    if (loading) {
        return <>
            <AddEditRule onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} flags={flags} />
            <div className="spinner-border" role="status">
                <span data-testid="rules-loading" className="visually-hidden"></span>
            </div>
        </>
    }
    
    if (error) {
        return <>
            <AddEditRule onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} flags={flags} />
            <p data-testid="rules-load-error">Oops! Looks like we can't get your rules right now. Try reloading the page.</p>
        </>
    }

    const rules = data.data as IApiRule[]

    if (!rules?.length) { // empty
        return <>
            <AddEditRule onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} flags={flags} />
            <Container className="text-center">
                <p data-testid="no-rules-found">You have no rules.</p>
            </Container>
        </>
    }

    const selectedRule = rules.find(r => r.id === selectedRuleId);

    const sortedRules = sortBy(rules, (r: IApiRule) => r.value);
    
    return <>
        <AddEditRule onCreate={onCreate} onUpdate={onUpdate} onDelete={onDelete} flags={flags} rule={selectedRule} key={selectedRuleId} />

        {sortedRules.map(rule => <Rule rule={rule} showModal={(id) => {
            console.log(id);
            setSelectedRuleId(id)
        }} key={rule.id}/>)}
    </>;
}
