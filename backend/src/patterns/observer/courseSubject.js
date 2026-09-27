/**
 * GoF Observer pattern: courses/quizzes publish events, enrolled students get notified
 * without the publisher knowing anything about how notifications are delivered.
 */
const Enrollment = require('../../models/Enrollment');
const Notification = require('../../models/Notification');

class Observer {
  // eslint-disable-next-line no-unused-vars
  update(subject, eventType, payload) {
    throw new Error('update() must be implemented by subclass');
  }
}

class Subject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  async notify(eventType, payload) {
    for (const observer of this.observers) {
      // eslint-disable-next-line no-await-in-loop
      await observer.update(this, eventType, payload);
    }
  }
}

class EnrolledStudentsNotifier extends Observer {
  /** Concrete Observer: fan the event out to a Notification document per enrolled student. */
  async update(subject, eventType, { courseId, message, url = '' }) {
    const enrollments = await Enrollment.find({ course: courseId }).select('student');
    if (!enrollments.length) return;
    await Notification.insertMany(
      enrollments.map((e) => ({ recipient: e.student, message, url })),
    );
  }
}

class CourseSubject extends Subject {
  /** Concrete Subject shared by the whole app; pre-wired with the default observer. */
  constructor() {
    super();
    this.attach(new EnrolledStudentsNotifier());
  }
}

const courseSubject = new CourseSubject();

module.exports = { courseSubject, Observer, Subject };
