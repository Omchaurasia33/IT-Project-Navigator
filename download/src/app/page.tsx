import { getTasks, getUsers } from '@/lib/data';
import ProjectPage from '@/components/project-page';

export default async function Home() {
  const tasks = await getTasks();
  const users = await getUsers();

  return (
    <main>
      <ProjectPage initialTasks={tasks} users={users} />
    </main>
  );
}
