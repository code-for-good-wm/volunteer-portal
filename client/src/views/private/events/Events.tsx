import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
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
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';

import { useAppSelector } from '../../../store/hooks';
import { selectAllEvents } from '../../../store/eventsSlice';
import { selectAllAttendances } from '../../../store/eventAttendanceSlice';
import { Status } from '../../../types/event';
import { loadAllEvents, loadAttendance } from '../../../services/event';
import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';
import { statusChipProps } from '../../../helpers/eventStatus';

type Data = {
  id: string;
  name: string;
  programName: string;
  startDate: string;
  dates: string;
  location: string;
  rsvpCount: number;
  rsvpLabel: string;
  status: Status;
};

type SortKey = 'name' | 'programName' | 'startDate' | 'location' | 'rsvpCount' | 'status';
type SortDirection = 'asc' | 'desc';

type SortableColumn = {
  id: SortKey;
  label: string;
};

const sortableColumns: SortableColumn[] = [
  { id: 'name', label: 'Event · Program' },
  { id: 'startDate', label: 'Dates' },
  { id: 'location', label: 'Location' },
  { id: 'rsvpCount', label: 'RSVPs' },
  { id: 'status', label: 'State' },
];

// Dates are stored as UTC midnight (from date-only form inputs) — format in UTC so the
// displayed calendar day always matches what was entered, regardless of browser timezone.
const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const dateFormatterWithYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.toDateString() === end.toDateString()) {
    return dateFormatterWithYear.format(start);
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${dateFormatter.format(start)} – ${dateFormatterWithYear.format(end)}`;
  }

  return `${dateFormatterWithYear.format(start)} – ${dateFormatterWithYear.format(end)}`;
};

const formatRsvpLabel = (status: Status, count: number) => {
  if (status === 'draft') {
    return '—';
  }
  if (status === 'complete') {
    return `${count} attended`;
  }
  if (status === 'cancelled') {
    return `${count} signed up`;
  }
  return `${count} attending`;
};

// custom table header
const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    fontWeight: 700
  }
}));

const Events = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const eventsData = useAppSelector(selectAllEvents);
  const attendanceData = useAppSelector(selectAllAttendances);

  // load data on first visit
  useEffect(() => {
    loadAllEvents();
    loadAttendance();
  }, []);

  const rows = useMemo<Data[]>(() => {
    return eventsData.map(event => {
      const rsvpCount = attendanceData.filter(a => a.event === event._id && a.attendance !== 'not-attending').length;

      return {
        id: event._id,
        name: event.name,
        programName: event.program?.name ?? '',
        startDate: event.startDate,
        dates: formatDateRange(event.startDate, event.endDate),
        location: event.location,
        rsvpCount,
        rsvpLabel: formatRsvpLabel(event.status, rsvpCount),
        status: event.status,
      };
    });
  }, [eventsData, attendanceData]);

  const filteredRows = useMemo(() => {
    if (!filter || rows.length === 0) {
      return rows;
    }

    const searchVal = filter.toLocaleLowerCase();

    return rows.filter(r =>
      r.name?.toLocaleLowerCase().includes(searchVal)
      || r.programName?.toLocaleLowerCase().includes(searchVal)
      || r.location?.toLocaleLowerCase().includes(searchVal)
    );
  }, [filter, rows]);

  const sortedRows = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    return [...filteredRows].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue)) * direction;
    });
  }, [filteredRows, sortBy, sortDirection]);

  const handleSort = (column: SortKey) => {
    if (column === sortBy) {
      setSortDirection(prevState => prevState === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <h1>
            events
          </h1>

          <Grid container spacing={2} sx={{ marginBottom: '1rem' }} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <TextField
                label="Search events"
                id="searchFilter"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StandardButton label="+ New Event" handler={() => navigate('/events/new')} />
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="events table">
                <TableHead>
                  <TableRow>
                    {sortableColumns.map((column) => (
                      <StyledTableCell key={column.id}>
                        <TableSortLabel
                          active={sortBy === column.id}
                          direction={sortBy === column.id ? sortDirection : 'asc'}
                          onClick={() => handleSort(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      </StyledTableCell>
                    ))}
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow hover tabIndex={-1} key={row.id}>
                        <TableCell>
                          <div>{row.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(0, 0, 0, 0.6)' }}>{row.programName}</div>
                        </TableCell>
                        <TableCell>{row.dates}</TableCell>
                        <TableCell>{row.location}</TableCell>
                        <TableCell>{row.rsvpLabel}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={statusChipProps[row.status].label}
                            color={statusChipProps[row.status].color}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <span
                            className="link"
                            style={{ cursor: 'pointer' }}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/events/${row.id}`)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { navigate(`/events/${row.id}`); } }}
                          >
                            View
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
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

export default Events;
