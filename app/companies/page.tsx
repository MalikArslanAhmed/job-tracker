import { getCompanies } from "@/lib/applications";
import CompaniesPage from "./CompaniesPage";

export default function Page() {
    const companies = getCompanies();

    return <CompaniesPage companies={companies} />;
}