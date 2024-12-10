import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { Eye } from 'lucide-react'

interface SearchResultsProps {
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    institution: string;
    academicYear: string;
  }>;
  onViewDetails: (id: string) => void;
}

export function SearchResults({ applications, onViewDetails }: SearchResultsProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ad Soyad</TableHead>
          <TableHead>E-posta</TableHead>
          <TableHead>Kurum</TableHead>
          <TableHead>Akademik Yıl</TableHead>
          <TableHead>İşlem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{app.fullName}</TableCell>
            <TableCell>{app.email}</TableCell>
            <TableCell>{app.institution}</TableCell>
            <TableCell>{app.academicYear}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(app.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Detaylar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

