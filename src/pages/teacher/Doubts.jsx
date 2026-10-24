import { getTeacherCourseClasses } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import DoubtBoard from '../../components/DoubtBoard.jsx';

export default function TeacherDoubts() {
  const { session } = useAuth();
  return <DoubtBoard role="teacher" courseClasses={getTeacherCourseClasses(session.id)} />;
}
