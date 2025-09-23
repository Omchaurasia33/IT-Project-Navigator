'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task, User } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { eachDayOfInterval, format, differenceInDays, startOfToday } from 'date-fns'

interface GanttViewProps {
  tasks: Task[]
  users: User[]
}

type GanttTask = {
  id: string
  name: string
  assignee: string
  days: number[]
  status: string
  priority: string
  start: Date
  end: Date
}

const statusColors: { [key: string]: string } = {
  todo: 'hsl(var(--muted-foreground) / 0.5)',
  'in-progress': 'hsl(var(--accent))',
  done: 'hsl(var(--primary))',
  canceled: 'hsl(var(--destructive) / 0.5)',
}

const flattenTasks = (tasks: Task[]): Task[] => {
  let flat: Task[] = []
  tasks.forEach(task => {
    flat.push(task)
    if (task.subtasks && task.subtasks.length > 0) {
      flat = flat.concat(flattenTasks(task.subtasks))
    }
  })
  return flat
}

export default function GanttView({ tasks, users }: GanttViewProps) {
  const flatTasks = flattenTasks(tasks)

  if (flatTasks.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Gantt Chart</CardTitle>
              </CardHeader>
              <CardContent>
                  <p>No tasks to display in the chart.</p>
              </CardContent>
          </Card>
      )
  }

  const projectStart = new Date(Math.min(...flatTasks.map(t => new Date(t.startDate).getTime())))
  const projectEnd = new Date(Math.max(...flatTasks.map(t => new Date(t.dueDate).getTime())))

  const dateInterval = eachDayOfInterval({ start: projectStart, end: projectEnd })
  const days = dateInterval.map(d => format(d, 'MMM d'))

  const ganttData: GanttTask[] = flatTasks.map((task) => {
    const start = new Date(task.startDate)
    const end = new Date(task.dueDate)
    const assignee = users.find(u => u.id === task.assigneeId)?.name || 'Unassigned'
    
    const startDay = differenceInDays(start, projectStart)
    const duration = differenceInDays(end, start) + 1
    
    return {
      id: task.id,
      name: task.title,
      assignee,
      days: [startDay, duration],
      status: task.status,
      priority: task.priority,
      start,
      end
    }
  }).sort((a,b) => a.start.getTime() - b.start.getTime());


  const today = startOfToday()
  const todayIndex = differenceInDays(today, projectStart)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250 + ganttData.length * 40}>
          <BarChart
            data={ganttData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            barCategoryGap="35%"
          >
            <XAxis type="number" domain={[0, days.length]} tickFormatter={(v) => days[v] || ''} />
            <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const data = payload[0].payload as GanttTask;
                  return (
                    <div className="bg-popover text-popover-foreground p-2 border rounded-md shadow-lg">
                      <p className="font-bold">{data.name}</p>
                      <p>Assignee: {data.assignee}</p>
                      <p>Status: <span className="capitalize">{data.status}</span></p>
                      <p>Duration: {format(data.start, 'MMM d')} - {format(data.end, 'MMM d')}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
             {todayIndex >= 0 && todayIndex < days.length && (
              <ReferenceLine x={todayIndex} stroke="hsl(var(--accent))" strokeDasharray="3 3" label={{ value: 'Today', position: 'insideTopLeft', fill: 'hsl(var(--accent))' }} />
            )}
            <Bar dataKey="days" stackId="a" fill="hsl(var(--primary))">
              {ganttData.map((entry) => (
                <Bar key={entry.id} fill={statusColors[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
