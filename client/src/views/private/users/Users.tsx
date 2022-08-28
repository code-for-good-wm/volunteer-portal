import React, { useEffect, useState } from 'react';

import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { useAppSelector } from '../../../store/hooks';
import { users, profiles } from '../../../store/usersSlice';
import { UserRole } from '../../../types/user';
import { DietaryRestriction, Profile, Role, ShirtSize } from '../../../types/profile';
import { getUsersData, getProfilesData, exportUsersAndProfilesData } from '../../../services/users';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import { parsePhone, toTitleCase } from '../../../helpers/functions';

interface Column {
  id: 'userRole' | 'name' | 'email' | 'phone' | 'roles' | 'previousVolunteer' | 'teamLeadCandidate' | 'shirtSize' | 'dietaryRestrictions' | 'additionalDietaryRestrictions' | 'accessibilityRequirements' | 'photoRelease' | 'hasSkills';
  label: string;
  minWidth?: number;
  align?: 'right';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any) => string;
}

const columns: Column[] = [
  { id: 'userRole', label: 'Type', minWidth: 100, format: (value: string) => toTitleCase(value) },
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'email', label: 'Email', minWidth: 170 },
  { id: 'phone', label: 'Phone #', minWidth: 170, format: (value: string) => value ? parsePhone(value).formatted : '' },
  { id: 'roles', label: 'Roles', minWidth: 100, format: (value: Role[]) => toTitleCase(value.join(', ')) },
  { id: 'previousVolunteer', label: 'Previous Volunteer', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
  { id: 'teamLeadCandidate', label: 'Team Lead', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
  { id: 'shirtSize', label: 'Shirt Size', minWidth: 100 },
  { id: 'dietaryRestrictions', label: 'Dietary Restrictions', minWidth: 100, format: (value: DietaryRestriction[]) => toTitleCase(value.join(', ')) },
  { id: 'additionalDietaryRestrictions', label: 'Addl. Dietary Restrictions', minWidth: 170 },
  { id: 'accessibilityRequirements', label: 'Accessibility Requirements', minWidth: 170 },
  { id: 'photoRelease', label: 'Photo Release', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
  { id: 'hasSkills', label: 'Entered Skills', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
];

type Data = {
  id: string;
  userRole: UserRole;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  previousVolunteer: boolean;
  teamLeadCandidate: boolean;
  shirtSize: ShirtSize;
  dietaryRestrictions: DietaryRestriction[];
  additionalDietaryRestrictions: string;
  accessibilityRequirements: string;
  photoRelease: boolean;
  hasSkills: boolean;
};

const Users = () => {
  const [rows, setRows] = useState<Data[]>([]);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const usersData = useAppSelector(users);
  const profilesData = useAppSelector(profiles);

  // load data on first visit
  useEffect(() => {
    getUsersData();
    getProfilesData();
  }, []);

  // create rows from userProfile
  useEffect(() => {
    if (!usersData) { return; }
    const rowData: Data[] = [];
    const profilesDict: {[key: string]: Profile} = {};

    if (profilesData) {
      for (const profile of profilesData) {
        profilesDict[profile.user] = profile;
      }
    }

    for (const user of usersData) {
      const profile = profilesDict[user._id];
      const row = {
        id: user._id,
        userRole: user.userRole,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: profile?.roles ?? [],
        previousVolunteer: profile?.previousVolunteer ?? false,
        teamLeadCandidate: profile?.teamLeadCandidate ?? false,
        shirtSize: profile?.shirtSize ?? '',
        dietaryRestrictions: profile?.dietaryRestrictions ?? [],
        additionalDietaryRestrictions: profile?.additionalDietaryRestrictions ?? '',
        accessibilityRequirements: profile?.accessibilityRequirements ?? '',
        photoRelease: profile?.agreements?.photoRelease ?? false,
        hasSkills: !!(profile?.completionDate ?? profile?.skills?.length ?? false)
      } as Data;

      rowData.push(row);
    }

    setRows(rowData);
  }, [usersData, profilesData]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleButton = () => {
    setProcessing(true);

    // Download CSV
    const success = (response: Response) => {
      const fileName = response.headers.get('Content-Disposition')?.replace('attachment; filename=', '') ?? 'usersExport.csv';
  
      // download hack since we need to send custom auth headers during download
      response.blob().then((data) => {
        const url = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();

        // Clean up and remove the link
        link.parentNode?.removeChild(link);

        setProcessing(false);
      }, () => { 
        failure(); 
      });
    };

    const failure = () => {
      setProcessing(false);
    };

    exportUsersAndProfilesData({ success, failure });
  };

  // custom table header
  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.head}`]: {
      fontWeight: 700
    }
  }));

  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            Users
          </h1>

          <div className="mb-1">
            <StandardButton
              label="Download all users"
              handler={handleButton}
              disabled={processing}
            />
          </div>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <StyledTableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format
                                  ? column.format(value)
                                  : value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      </div>
    </PageLayout>
  );
};

export default Users;