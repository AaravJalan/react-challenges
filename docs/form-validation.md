Add validation to the course edit form with immediate user feedback for all editable course fields:
Term: must be selected from the choices Fall, Winter, Spring, or Summer.
Course number: must be either 3 digits (e.g. 213) or 5 digits with section (e.g. 213-2).
Course title: must be at least two characters (e.g., "AI" is accepted, but "X" is not).
Meeting times: must be either an empty string or a legal meeting time with days and a start-end timespan (e.g., MWF 12:00-13:20, where start time < end time).
Display helpful inline error messages next to or under fields that have invalid data.
