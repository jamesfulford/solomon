import RRule from 'rrule';
import { convertWorkingStateToApiRuleMutate, ruleToWorkingState } from './translation';

const rules = [
    {
        name: 'Twice Weekly Gas',
        value: -30,
        rrule: new RRule({
            freq: RRule.WEEKLY,
            byweekday: [RRule.MO, RRule.TH],
        }).toString(),
        labels: {},
    },
    {
        name: 'Weekly Groceries',
        value: -120,
        rrule: new RRule({
            freq: RRule.WEEKLY,
            byweekday: [RRule.SU],
        }).toString(),
        labels: {},
    },
    {
        name: 'Biweekly Paycheck',
        value: 2000,
        rrule: new RRule({
            freq: RRule.WEEKLY,
            interval: 2,
            byweekday: [RRule.TH],
            dtstart: new Date('2020-11-03'),
            until: new Date('2021-05-22'),
        }).toString(),
        labels: {},
    },
    {
        name: 'Monthly Rent',
        value: -1000,
        rrule: new RRule({
            freq: RRule.MONTHLY,
            bymonthday: 1,
            dtstart: new Date('2020-11-03'),
        }).toString(),
        labels: {},
    },
    {
        name: 'Yearly Birthday',
        value: -100,
        rrule: new RRule({
            freq: RRule.YEARLY,
            dtstart: new Date('2020-10-01'),
        }).toString(),
        labels: {},
    },
    {
        name: 'Once Tuition',
        value: -100,
        rrule: new RRule({
            freq: RRule.YEARLY,
            dtstart: new Date('2020-01-25'),
            count: 1,
        }).toString(),
        labels: {
            category: 'school'
        },
    },
];

const rulesWithUncertainty = [
    {
        ...rules[0],
        labels: {
            uncertainty: true,
            lowUncertainty: rules[0].value - 10,
            highUncertainty: rules[0].value + 20,
        }
    }
]


describe('add/edit translation', () => {
    rules.forEach(rule => {
        it(`editing should have no impact if editless ${rule.name}`, () => {
            const workingState = ruleToWorkingState(rule);
            const outputRule = convertWorkingStateToApiRuleMutate(workingState, {});
    
            expect(outputRule).toEqual(rule);
        });
    });

    describe('isHighEnabled', () => {
        rules.forEach(rule => {
            it(`editing should add uncertainty if editless ${rule.name}`, () => {
                const workingState = ruleToWorkingState(rule);
                const outputRule = convertWorkingStateToApiRuleMutate(workingState, { isHighLowEnabled: true });
        
                expect(outputRule).toEqual({
                    ...rule,
                    labels: {
                        ...rule.labels,
                        uncertainty: false,
                    }
                });
            });
        });

        rulesWithUncertainty.forEach(rule => {
            it(`editing should keep uncertainty labels if editless ${rule.name}`, () => {
                const workingState = ruleToWorkingState(rule);
                const outputRule = convertWorkingStateToApiRuleMutate(workingState, { isHighLowEnabled: true });
        
                expect(outputRule).toEqual(rule);
            });
        });
    });
});
