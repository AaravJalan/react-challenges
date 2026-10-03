import './App.css';

const schedules = {
  "CS-2018-2019": {
    title: 'CS Courses for 2018-2019',
    courses: {
      "F101": {
        term: "Fall",
        number: "101",
        meets: "MWF 11:00-11:50",
        title: "Computer Science: Concepts, Philosophy, and Connections"
      },
      "F110": {
        term: "Fall",
        number: "110",
        meets: "MWF 10:00-10:50",
        title: "Intro Programming for non-majors"
      },
      "S313": {
        term: "Spring",
        number: "313",
        meets: "TuTh 15:30-16:50",
        title: "Tangible Interaction Design and Learning"
      },
      "S314": {
        term: "Spring",
        number: "314",
        meets: "TuTh 9:30-10:50",
        title: "Tech & Human Interaction"
      }
    }
  }
};

const schedule = schedules["CS-2018-2019"];

const CourseCard = ({ course }: { course: { term: string; number: string; meets: string; title: string } }) => (
  <div className="modern-card">
    <h2 className="modern-card-header">
      {course.term} CS {course.number}
    </h2>
    <p className="modern-card-title">
      {course.title}
    </p>

    <div className="modern-card-footer">
      <p className="modern-card-meets">
        {course.meets}
      </p>
    </div>
  </div>
);

const App = () => (
  <div className="modern-app">
    <main className="modern-main">
      <h1 className="modern-title">
        {schedule.title}
      </h1>
      <div className="modern-card-grid">
        {Object.entries(schedule.courses).map(([id, course]) => (
          <CourseCard key={id} course={course} />
        ))}
      </div>
    </main>
  </div>
);

export default App;
