'use client';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Student } from '@/lib/types';

interface StudentRosterProps {
  students: Student[];
}

export function StudentRoster({ students }: StudentRosterProps) {
  const getHref = (path: string) => `${path}`;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead className="hidden md:table-cell">Class</TableHead>
          <TableHead className="hidden md:table-cell">Grade</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map(student => (
          <TableRow key={student.id}>
            <TableCell>
              <Link href={getHref(`/students/${student.id}`)} className="flex items-center gap-3 hover:underline">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint={student.imageHint}/>
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="font-medium">{student.name}</div>
              </Link>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{student.classId}</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{student.grade}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={getHref(`/students/${student.id}`)}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Log Incident</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
