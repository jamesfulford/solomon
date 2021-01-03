
def extract_hebrew(rrulestring: str) -> (int, int):
    # "X-YEARLY-HEBREW: 1, 16"
    # If is not yearly hebrew format, `undefined`
    # If is yearly hebrew format but invalid format, throws Error
    # Otherwise, returns month and day

    if rrulestring.startswith("X-YEARLY-HEBREW:"):
        try:
            holiday = rrulestring.replace("X-YEARLY-HEBREW:", "")
            return tuple(map(int, map(str.strip, holiday.split(","))))
        except Exception:
            assert False, f'Invalid Hebrew date format: {rrulestring}'
