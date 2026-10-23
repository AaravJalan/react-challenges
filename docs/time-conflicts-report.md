# React Challenge Learning Report

**Name:** Aarav Jalan  
**Task:** Time Conflicts

---

### Learning goals: What general concepts or skills are you trying to learn or get better at?
Writing helper functions to parse strings into days and time numbers, detecting overlapping intervals, and dynamically disabling items in React based on state constraints.

---

### Specification: What is your prompt for the functionality you want?
Make it impossible for a user to select a class that has a time conflict with any classes they have already selected. Two classes have a time conflict if they meet in the same term, have at least one day in common, and their timespans overlap. Classes with an empty meeting string never conflict. Unselectable courses should be visually distinct (faded/disabled) and clicking them should not select them. Unselecting already selected classes must still work. Place conflict detection logic in a dedicated utility module.

---

### Plan: In English, what are the important bits of code needed to do this?
1. Write a `timeConflicts.ts` utility file:
   - `getDays(meets)`: extracts days from the string (`match(/Tu|Th|M|W|F/g)`).
   - `getTimes(meets)`: splits the time range and converts `"HH:MM"` into minutes from midnight.
   - `hasConflict(c1, c2)`: returns true if both courses have the same term, share at least one day (`days1.some(d => days2.includes(d))`), and overlap in time (`start1 < end2 && start2 < end1`).
   - `hasTimeConflict(course, selectedCourses)`: returns true if the course conflicts with any already selected course (`selected.some(...)`).
2. In `TermPage.tsx`:
   - Compute `disabled = !selected.includes(id) && hasTimeConflict(course, selectedCourses)`.
   - Pass `disabled` prop to each `CourseCard`.
3. In `CourseCard.tsx`:
   - If `disabled`, apply faded styling (`opacity-40 cursor-not-allowed`) and prevent clicks from toggling selection.

---

### Resources: What are you reading / watching to learn how to do this?
- [Defining JavaScript code modules](https://courses.cs.northwestern.edu/394/guides/intermed-js.html#code-modules)
- [Array methods](https://courses.cs.northwestern.edu/394/guides/intro-js.html#array-methods)
- [String properties and methods](https://courses.cs.northwestern.edu/394/guides/intro-js.html#string-properties)
- [Working with mixed types](https://courses.cs.northwestern.edu/394/guides/intro-js.html#mixed-types)

---

### Commit: What code is needed? Write real code but just the lines relevant to what you are trying to learn.

```ts
// src/utilities/timeConflicts.ts
const getDays = (meets: string) => meets.match(/Tu|Th|M|W|F/g) || [];

const getTimes = (meets: string) => {
  const time = meets.split(' ')[1];
  if (!time) return [0, 0];
  const [start, end] = time.split('-');
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return [toMin(start), toMin(end)];
};

export const hasConflict = (c1: Course, c2: Course) => {
  if (c1.term !== c2.term || !c1.meets || !c2.meets) return false;
  const days1 = getDays(c1.meets);
  const days2 = getDays(c2.meets);
  const [start1, end1] = getTimes(c1.meets);
  const [start2, end2] = getTimes(c2.meets);

  return days1.some(d => days2.includes(d)) && start1 < end2 && start2 < end1;
};

export const hasTimeConflict = (course: Course, selected: Course[]) =>
  selected.some(c => hasConflict(course, c));

// In TermPage.tsx:
const selectedCourses = selected.map(id => schedule.courses[id]);
const disabled = !selected.includes(id) && hasTimeConflict(course, selectedCourses);

<CourseCard
  key={id}
  id={id}
  course={course}
  selected={selected.includes(id)}
  disabled={disabled}
  toggleSelected={toggleSelected}
/>

// In CourseCard.tsx:
const handleClick = () => {
  if (!disabled) toggleSelected(id);
};
```

---

### Consult: Compare each line of what you wrote above with the genAI output. What is different? Which code is better? Why? What surprises you, if anything?

- **Actionable User Feedback vs. Generic Disabled State:** In my code, a conflicting course was simply disabled with a generic `disabled` boolean and `✕` icon, giving the user no information on *which* course caused the clash. The GenAI output implemented `getConflictingCourse(course, selectedCourses)` to return the specific conflicting course, allowing the UI to render an informative badge (`✕ CS 111`) and a descriptive tooltip (`Time conflict with Fall CS 111 (MWF 11:00-11:50)`).
- **String Parsing Robustness:** My code used simple string `.split(' ')` and `.split('-')` chained calls, which are vulnerable to whitespace inconsistencies or unexpected formats. The GenAI code utilized a single robust regular expression (`/^([A-Za-z]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/`) with token extraction, safely handling spacing and format variations.
- **Performance Optimization (`useMemo`):** In my code, `selected.map()` and conflict lookups ran repeatedly across renders. The GenAI code wrapped `selectedCourseList` in a `useMemo` hook, ensuring the list of selected course objects is only recomputed when `selected` or `schedule.courses` actually changes.
- **Accessibility (WCAG):** The GenAI code enhanced the card with `aria-disabled={isConflict}`, managed `tabIndex` so keyboard focus skips unselectable cards, and provided title descriptions for assistive technologies.
- **Which code is better:** The GenAI code is significantly better in user experience and robustness. While the mathematical overlap logic (`start1 < end2 && start2 < end1`) is identical in both, the AI version turns a frustrating "disabled with no explanation" interaction into clear, helpful guidance.
- **Surprises:** How simple the interval overlap condition is in mathematics (`Math.max(start1, start2) < Math.min(end1, end2)` or `start1 < end2 && start2 < end1`) compared to writing multiple nested `if/else` checks, and how returning the conflicting object rather than a boolean completely elevates the user experience.

---

### Ask: What seems worth discussing in class? What is confusing, contradictory, mysterious?

1. **Handling 12-Hour vs 24-Hour Time Conventions:** Some real-world academic data sources format evening courses as `"3:30-4:50"` instead of `"15:30-16:50"`. Without explicit `AM/PM` designations, how do scheduling algorithms reliably disambiguate afternoon/evening classes without making hardcoded assumptions (e.g. assuming any hour $< 8$ is in the afternoon)?
2. **Pre-computation vs. On-the-Fly Calculation:** We calculate conflicts on-the-fly whenever `selected` changes. For larger course catalogs (e.g., thousands of sections), is it better to pre-calculate a graph of pairwise conflicting courses on data load, or compute them dynamically per user selection?

---

### Integrate: Summarize how this part went. How much more work did you have to do to get it working? What else did you learn beyond your learning goals?

Integration went smoothly:
1. Created `src/utilities/timeConflicts.ts` with parsed meetings, day overlap detection, interval overlap checks, and `getConflictingCourse`.
2. Updated `TermPage.tsx` using `useMemo` to memoize the selected courses array and dynamically determine if any course conflicts with the current plan.
3. Enhanced `CourseCard.tsx` to display an informative red conflict badge (e.g., `✕ CS 111`) with a tooltip explaining the conflict and meeting time, while ensuring already selected courses remain clickable so they can be unselected.
4. Tested multiple conflict scenarios in the browser (e.g., selecting `CS 111` immediately disables overlapping sections like `CS 211` on `MWF 12:30-13:50`, while leaving non-overlapping or different-term classes selectable). Verified `npm run build` succeeds cleanly.

---

## GenAI Output Tab

### Prompt: What did you put in a Markdown specification file?

```markdown
Make it impossible for a user to select a class that has a time conflict with any classes they have already selected.
Requirements:
1. Two classes conflict if they meet in the same term, have at least one day in common, and their timespans overlap. Classes with empty meeting strings never conflict.
2. Put conflict calculation in a dedicated utility module (src/utilities/timeConflicts.ts) with pure helper functions.
3. Identify the specific conflicting class so the UI can inform the user (e.g. "Conflicts with CS 111").
4. Unselectable courses must be visually distinct (faded/disabled) and unclickable.
5. Classes already selected must remain clickable so they can be unselected.
6. Use useMemo to avoid redundant calculations on re-renders.
```

### GenAI Output: What did genAI produce, before you did any changes? Skip code not relevant for comparison.

```ts
// src/utilities/timeConflicts.ts:
export const parseMeeting = (meets: string) => {
  if (!meets) return null;
  const match = meets.trim().match(/^([A-Za-z]+)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
  if (!match) return null;
  const [, daysStr, startStr, endStr] = match;
  const days = daysStr.match(/Tu|Th|Sa|Su|M|W|F/g) || [];
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  return { days, start: toMinutes(startStr), end: toMinutes(endStr) };
};

export const hasConflict = (c1: Course, c2: Course) => {
  if (c1.term !== c2.term) return false;
  const m1 = parseMeeting(c1.meets);
  const m2 = parseMeeting(c2.meets);
  if (!m1 || !m2) return false;
  return m1.days.some(d => m2.days.includes(d)) &&
         Math.max(m1.start, m2.start) < Math.min(m1.end, m2.end);
};

export const getConflictingCourse = (course: Course, selectedCourses: Course[]) =>
  selectedCourses.find(selected => hasConflict(course, selected));

// In TermPage.tsx:
const selectedCourseList = useMemo(() => {
  return selected.map(selId => schedule.courses[selId]).filter(Boolean);
}, [selected, schedule.courses]);

const conflictCourse = !isSelected ? getConflictingCourse(course, selectedCourseList) : undefined;

// In CourseCard.tsx:
{isConflict && conflictCourse && (
  <span className="absolute top-4 right-4 ...">
    ✕ CS {conflictCourse.number}
  </span>
)}
```
