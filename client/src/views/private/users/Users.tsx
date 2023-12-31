import { useEffect, useState } from 'react';

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
import { selectAllEvents } from '../../../store/eventsSlice';
import { UserRole } from '../../../types/user';
import { Event } from '../../../types/event';
import { DietaryRestriction, Profile, Role, ShirtSize } from '../../../types/profile';
import { getUsersData, getProfilesData, exportUsersAndProfilesData } from '../../../services/users';
import { loadAttendance, loadUpcomingEvents } from '../../../services/event';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import { parsePhone, toTitleCase } from '../../../helpers/functions';
import { Attendance } from '../../../types/event';
import { selectAllAttendances } from '../../../store/eventAttendanceSlice';

interface Column {
  id: 'userRole' | 'name' | 'email' | 'phone' | 'roles' | 'previousVolunteer' | 'teamLeadCandidate' | 'shirtSize' | 'dietaryRestrictions' | 'additionalDietaryRestrictions' | 'accessibilityRequirements' | 'photoRelease' | 'hasSkills' | 'attendance';
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
  { id: 'attendance', label: 'Attending WfG 2023', minWidth: 200, format: (value: Attendance) => toTitleCase(value ? value.replace('-', ' ') : '') },
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
  attendance: Attendance
};

const Users = () => {
  const [rows, setRows] = useState<Data[]>([]);
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [event, setEvent] = useState<Event>();

  const usersData = useAppSelector(users);
  const profilesData = useAppSelector(profiles);
  const eventsData = useAppSelector(selectAllEvents);
  const attendanceData = useAppSelector(selectAllAttendances);

  // load data on first visit
  // there's probably a better way to do all of this
  useEffect(() => {
    getUsersData();
    getProfilesData();
    loadUpcomingEvents();
  }, []);

  useEffect(() => {
    // locate the WfG 2023 event
    // TODO: make this selectable
    eventsData
      .filter(e => e.description === 'Weekend for Good 2023')
      .map(e => {
        loadAttendance(e._id);
        setEvent(e);
      });
  }, [eventsData]);

  // create rows from userProfile
  useEffect(() => {
    if (!usersData) { return; }
    let rowData: Data[] = [];
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

    if (event) {
      rowData = rowData.map(r => {
        const attd = attendanceData.find(a => a.event === event?._id && a.user === r.id);
        return {
          ...r,
          attendance: attd?.attendance
        } as Data;
      });
    }

    setRows(rowData);
  }, [usersData, profilesData, attendanceData, event]);


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
      <div className="fullViewContainer">
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