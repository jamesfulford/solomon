import React, { useCallback, useState } from 'react'
import { Rule } from './Rule';
import sortBy from 'lodash/sortBy';
import Container from 'react-bootstrap/Container';
import { AddEditRule } from './AddEditRule';
import { useThunkDispatch } from '../../../useDispatch';
import { createRule, deleteRule, fetchRules, updateRule } from '../../../store/reducers/rules';
import { useSelector } from 'react-redux';
import { getRules } from '../../../store/reducers/rules/getters';
import { IApiRule, IApiRuleMutate } from '../../../services/RulesService';


export const RulesContainer = () => {
    const dispatch = useThunkDispatch();

    // const [{ data, loading, error }, refetch]
    React.useEffect(() => {
        dispatch(fetchRules() as any);
    }, [dispatch]);

    const {
        rules: { data, loading, error },
    } = useSelector(state => ({
        rules: getRules(state as any),
    }))


    const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

    const createNewRule = useCallback((rule: IApiRuleMutate) => {
        return dispatch(createRule(rule) as any);
    }, [dispatch]);

    const deleteHandler = useCallback((id: string) => {
        return dispatch(deleteRule(id) as any);
    }, [dispatch]);

    const updateExistingRule = useCallback((id: string, rule: IApiRuleMutate) => {
        return dispatch(updateRule(id, rule) as any);
    }, [dispatch]);

    // translate to props
    const onUpdate = useCallback(async (rule: IApiRuleMutate) => {
        if (!selectedRuleId) {
            console.warn("Attempted to update rule without rule selected. Ignoring. (this should never happen)");
            return;
        }
        return updateExistingRule(selectedRuleId, rule)
            .then(() => setSelectedRuleId(undefined));
    }, [selectedRuleId, updateExistingRule]);

    const onDelete = useCallback(async () => {
        if (!selectedRuleId) {
            console.warn("Attempted to delete rule without rule selected. Ignoring. (this should never happen)");
            return;
        }
        return deleteHandler(selectedRuleId);
    }, [selectedRuleId, deleteHandler])

    if (loading) {
        return <>
            <AddEditRule onCreate={createNewRule} onUpdate={onUpdate} onDelete={onDelete} />
            <div className="spinner-border" role="status">
                <span data-testid="rules-loading" className="visually-hidden"></span>
            </div>
        </>
    }
    
    if (error) {
        return <>
            <AddEditRule onCreate={createNewRule} onUpdate={onUpdate} onDelete={onDelete} />
            <p data-testid="rules-load-error">Oops! Looks like we can't get your rules right now. Try reloading the page.</p>
        </>
    }

    const rules = data;

    if (!rules?.length) { // empty
        return <>
            <AddEditRule onCreate={createNewRule} onUpdate={onUpdate} onDelete={onDelete} />
            <Container className="text-center">
                <p data-testid="no-rules-found">You have no rules.</p>
            </Container>
        </>
    }

    const selectedRule = rules.find(r => r.id === selectedRuleId);

    const sortedRules = sortBy(rules, (r: IApiRule) => r.value);
    
    return <>
        <AddEditRule onCreate={createNewRule} onUpdate={onUpdate} onDelete={onDelete} rule={selectedRule} key={selectedRuleId} />

        {sortedRules.map(rule => <Rule rule={rule} showModal={(id) => {
            console.log(id);
            setSelectedRuleId(id)
        }} key={rule.id}/>)}
    </>;
}
