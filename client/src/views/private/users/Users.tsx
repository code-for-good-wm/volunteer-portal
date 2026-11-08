import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';

import { useAppSelector } from '../../../store/hooks';
import { users, profiles } from '../../../store/usersSlice';
import { UserRole } from '../../../types/user';
import { Role } from '../../../types/profile';
import { getUsersData, getProfilesData, exportUsersAndProfilesData } from '../../../services/users';
import PageLayout from '../../../layouts/PageLayout';
import RowActionButton from '../../../components/buttons/RowActionButton';
import { parsePhone, toTitleCase } from '../../../helpers/functions';
import { roleLabels } from '../../../helpers/roles';

interface Column {
  id: 'name' | 'email' | 'phone' | 'userRole' | 'roles';
  label: string;
  minWidth?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any) => string;
}

// Everything else about a user lives on their detail page (and in the export).
const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'email', label: 'Email', minWidth: 170 },
  { id: 'phone', label: 'Phone', minWidth: 140, format: (value: string) => value ? parsePhone(value).formatted : '' },
  { id: 'userRole', label: 'Type', minWidth: 100, format: (value: string) => toTitleCase(value) },
  { id: 'roles', label: 'Roles', minWidth: 140, format: (value: Role[]) => value.map(role => roleLabels[role] ?? role).join(', ') },
];

type Data = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userRole: UserRole;
  roles: Role[];
};

const Users = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('');

  const usersData = useAppSelector(users);
  const profilesData = useAppSelector(profiles);

  // load data on first visit
  useEffect(() => {
    getUsersData();
    getProfilesData();
  }, []);

  const rows = useMemo<Data[]>(() => {
    if (!usersData) { return []; }
    const rolesByUser = new Map((profilesData ?? []).map(profile => [profile.user, profile.roles ?? []]));

    return usersData.map(user => ({
      id: user._id,
      name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userRole: user.userRole,
      roles: rolesByUser.get(user._id) ?? [],
    }));
  }, [usersData, profilesData]);

  const filteredRows = useMemo(() => {
    if (!filter || rows.length == 0) {
      return rows;
    }

    const searchVal = filter.toLocaleLowerCase();

    return rows.filter(r =>
      r.email?.toLocaleLowerCase().includes(searchVal)
      || r.firstName?.toLocaleLowerCase().includes(searchVal)
      || r.lastName?.toLocaleLowerCase().includes(searchVal)
    );
  }, [filter, rows]);

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
          <h1 className="pageTitle">
            Users
          </h1>

          <Grid container spacing={2} sx={{ marginBottom: '1rem' }} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                label="Search by name or email"
                id="searchFilter"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FileDownloadOutlinedIcon />}
                onClick={handleButton}
                disabled={processing}
              >
                {processing ? 'Preparing download…' : 'Download all users'}
              </Button>
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table aria-label="users table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <StyledTableCell
                        key={column.id}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.label}
                      </StyledTableCell>
                    ))}
                    <StyledTableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id}>
                                {column.format
                                  ? column.format(value)
                                  : value}
                              </TableCell>
                            );
                          })}
                          <TableCell align="right">
                            <RowActionButton
                              label="Open"
                              aria-label={`Open ${row.name || row.email}`}
                              onClick={() => navigate(`/users/${row.id}`)}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filteredRows.length}
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