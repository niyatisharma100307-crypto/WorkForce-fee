import { getStudentCourseClasses } from '../../store.js';
import { useAuth } from '../../components/AuthContext.jsx';
import DoubtBoard from '../../components/DoubtBoard.jsx';

export default function StudentDoubts() {
  const { session } = useAuth();
  return <DoubtBoard role="student" courseClasses={getStudentCourseClasses(session.id)} />;
}
