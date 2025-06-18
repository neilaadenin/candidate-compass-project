
import { useState } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { useVacancies } from "@/hooks/useVacancies";
import { useCompanies } from "@/hooks/useCompanies";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function CandidatePage() {
  const { candidates, loading } = useCandidates();
  const { vacancies } = useVacancies();
  const { companies } = useCompanies();
  const [filterCompanyId, setFilterCompanyId] = useState("");
  const [filterVacancyId, setFilterVacancyId] = useState("");

  const filteredCandidates = candidates.filter((candidate) => {
    let matchCompany = true;
    let matchVacancy = true;

    if (filterCompanyId && candidate.vacancies) {
      matchCompany = candidate.vacancies.company_id.toString() === filterCompanyId;
    }

    if (filterVacancyId) {
      matchVacancy = candidate.vacancy_id?.toString() === filterVacancyId;
    }

    return matchCompany && matchVacancy;
  });

  const filteredVacanciesByCompany = filterCompanyId
    ? vacancies.filter((vacancy) => vacancy.company_id.toString() === filterCompanyId)
    : vacancies;

  if (loading) {
    return <div>Loading candidates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Candidates</h2>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <Label>Filter by Company:</Label>
          <Select
            value={filterCompanyId}
            onValueChange={(value) => {
              setFilterCompanyId(value);
              setFilterVacancyId(""); // Reset vacancy filter when company changes
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All companies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id.toString()}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          <Label>Filter by Vacancy:</Label>
          <Select value={filterVacancyId} onValueChange={setFilterVacancyId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All vacancies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All vacancies</SelectItem>
              {filteredVacanciesByCompany.map((vacancy) => (
                <SelectItem key={vacancy.id} value={vacancy.id.toString()}>
                  {vacancy.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Profile URL</TableHead>
              <TableHead>Note Sent</TableHead>
              <TableHead>Connection Status</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Vacancy Name</TableHead>
              <TableHead>Apply Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.name}</TableCell>
                <TableCell>
                  {candidate.profile_url ? (
                    <a
                      href={candidate.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {candidate.note_sent || "-"}
                </TableCell>
                <TableCell>{candidate.connection_status || "-"}</TableCell>
                <TableCell>
                  {candidate.vacancies?.companies?.name || "-"}
                </TableCell>
                <TableCell>{candidate.vacancies?.title || "-"}</TableCell>
                <TableCell>
                  {candidate.apply_date
                    ? new Date(candidate.apply_date).toLocaleDateString()
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No candidates found with the current filters.
        </div>
      )}
    </div>
  );
}
