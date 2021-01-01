from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from dateutil.rrule import rrulestr


class ExecutionParameters():
    def __init__(self,
        start: date,
        end: date,
        current: float,
        set_aside: float,
        should_calculate_high_low: bool = False,
    ):
        self.start: date = start
        self.end: date = end
        self.current: float = current
        self.set_aside: float = set_aside
        self.should_calculate_high_low: bool = should_calculate_high_low
    
    def assert_valid(self):
        assert self.start < self.end, '`startDate` comes after `endDate`, when it should come before'
        assert self.set_aside >= 0, '`setAside` is negative, when it should be 0 or positive'

        # high-low is an expensive calculation at this time, limiting to 1 year
        if self.should_calculate_high_low:
            assert self.end <= self.start + relativedelta(years=1, days=1), "We do not support projections with high-low spanning more than 1 year."
        else:
            assert self.end <= self.start + relativedelta(years=30, days=1), "We do not support projections spanning more than 30 years."


class ExecutionRules():
    def __init__(self, rules_map):
        self.rules_map = rules_map
    
    def assert_valid(self):
        assert isinstance(self.rules_map, dict), "Root must be an object/map, like {}"
        for rule_id, rule in self.rules_map.items():
            assert "value" in rule, f"Rule `{rule_id}` is missing the `value` field"
            assert isinstance(rule["value"], (float, int)), f"Rule `{rule_id}`'s `value` must be a number"
            assert "rule" in rule, f"Rule `{rule_id}` is missing the `rule` field"
    
    def latest_one_time_date(self):
        one_time_dates = []
        for _rule_id, rule in self.rules_map.items():
            rrule = iter(rrulestr(rule["rule"]))
            d = None
            try:
                d = next(rrule)
                next(rrule)
            except StopIteration:
                if d:
                    one_time_dates.append(d.date())

        if not one_time_dates:
            return None
        
        return max(one_time_dates)


class ExecutionContext():
    def __init__(self, parameters: ExecutionParameters, rules: ExecutionRules):
        self.parameters: ExecutionParameters = parameters
        self.rules: ExecutionRules = rules

        latest_one_time_rule_date = self.rules.latest_one_time_date()
        if latest_one_time_rule_date:
            self.parameters.end = max(
                self.parameters.end,
                # adding an extra day so charts can see day after
                latest_one_time_rule_date + timedelta(days=1)
            )
    
    def assert_valid(self):
        self.parameters.assert_valid()
        self.rules.assert_valid()
