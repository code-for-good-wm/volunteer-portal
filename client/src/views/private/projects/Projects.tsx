import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

import { useAppSelector } from '../../../store/hooks';
import { selectAllProjects } from '../../../store/projectsSlice';
import { selectAllNonprofits } from '../../../store/nonprofitsSlice';
import { selectAllEvents } from '../../../store/eventsSlice';
import { selectAllPositions } from '../../../store/positionsSlice';
import { selectAllSlots } from '../../../store/slotsSlice';
import { loadProjects } from '../../../services/project';
import { loadNonprofits } from '../../../services/nonprofit';
import { loadAllEvents } from '../../../services/event';
import { loadPositionsForProject } from '../../../services/position';
import { loadSlotsForPosition } from '../../../services/slot';
import { ProjectStatus } from '../../../types/project';
import PageLayout from '../../../layouts/PageLayout';
import StatusChip, { StatusChipTheme } from '../../../components/elements/StatusChip';
import { colors } from '../../../material/colors';

type FilterId = 'proposed' | 'accepted' | 'rejected' | 'archived' | 'all';

const filterTabs: { id: FilterId, label: string }[] = [
  { id: 'proposed', label: 'Proposed' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Declined' },
  { id: 'archived', label: 'Archived' },
  { id: 'all', label: 'All' },
];

const statusDisplay: Record<ProjectStatus, { label: string, theme: StatusChipTheme }> = {
  proposed: { label: 'Proposed', theme: 'teal' },
  accepted: { label: 'Accepted', theme: 'success' },
  rejected: { label: 'Declined', theme: 'neutral' },
  archived: { label: 'Archived', theme: 'neutral' },
};

const actionLabel: Record<ProjectStatus, string> = {
  proposed: 'Review',
  accepted: 'Open',
  rejected: 'View',
  archived: 'View',
};

type Row = {
  id: string;
  projectName: string;
  nonprofitName: string;
  eventName: string;
  totalPositions: number;
  totalSlots: number;
  filledSlots: number;
  status: ProjectStatus;
};

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    fontWeight: 700,
    color: colors.text.secondary,
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    backgroundColor: colors.surface.subtle,
  },
}));

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [filter, setFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const projectsData = useAppSelector(selectAllProjects);
  const nonprofitsData = useAppSelector(selectAllNonprofits);
  const eventsData = useAppSelector(selectAllEvents);
  const positionsData = useAppSelector(selectAllPositions);
  const slotsData = useAppSelector(selectAllSlots);

  const fetchedProjectPositions = useRef(new Set<string>());
  const fetchedPositionSlots = useRef(new Set<string>());

  useEffect(() => {
    loadProjects();
    loadNonprofits();
    loadAllEvents();
  }, []);

  // Fetch positions for any project we haven't already fetched
  useEffect(() => {
    projectsData.forEach(project => {
      if (!fetchedProjectPositions.current.has(project._id)) {
        fetchedProjectPositions.current.add(project._id);
        loadPositionsForProject(project._id);
      }
    });
  }, [projectsData]);

  // Fetch slots for any position we haven't already fetched
  useEffect(() => {
    positionsData.forEach(position => {
      if (!fetchedPositionSlots.current.has(position._id)) {
        fetchedPositionSlots.current.add(position._id);
        loadSlotsForPosition(position._id);
      }
    });
  }, [positionsData]);

  const rows: Row[] = useMemo(() => {
    const nonprofitsById: Record<string, typeof nonprofitsData[number]> = {};
    for (const nonprofit of nonprofitsData) {
      nonprofitsById[nonprofit._id] = nonprofit;
    }

    const eventsById: Record<string, typeof eventsData[number]> = {};
    for (const event of eventsData) {
      eventsById[event._id] = event;
    }

    return projectsData.map(project => {
      const positions = positionsData.filter(p => p.project === project._id);
      const positionIds = new Set(positions.map(p => p._id));
      const slots = slotsData.filter(s => positionIds.has(s.position));
      const filledSlots = slots.filter(s => s.status === 'confirmed' || s.status === 'confirmed-partial').length;
      const totalSlots = positions.reduce((sum, p) => sum + p.slotCount, 0);

      const event = project.event ? eventsById[project.event] : undefined;

      return {
        id: project._id,
        projectName: project.name,
        nonprofitName: nonprofitsById[project.nonprofit]?.name ?? 'Unknown organization',
        eventName: event?.name ?? 'Not scoped yet',
        totalPositions: positions.length,
        totalSlots,
        filledSlots,
        status: project.status,
      };
    });
  }, [projectsData, nonprofitsData, eventsData, positionsData, slotsData]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterId, number> = { proposed: 0, accepted: 0, rejected: 0, archived: 0, all: rows.length };
    for (const row of rows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = activeFilter === 'all' ? rows : rows.filter(r => r.status === activeFilter);

    if (eventFilter !== 'all') {
      const event = eventsData.find(e => e._id === eventFilter);
      const eventLabel = event?.name;
      result = result.filter(r => r.eventName === eventLabel);
    }

    if (filter) {
      const searchVal = filter.toLocaleLowerCase();
      result = result.filter(r =>
        r.projectName.toLocaleLowerCase().includes(searchVal)
        || r.nonprofitName.toLocaleLowerCase().includes(searchVal)
      );
    }

    return result;
  }, [rows, activeFilter, filter, eventFilter, eventsData]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleAddProject = () => {
    navigate('/projects/new');
  };

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            Projects
          </h1>

          <Grid container spacing={2} sx={{ marginBottom: '1rem' }} alignItems="center">
            <Grid item xs={12}>
              <Tabs
                value={activeFilter}
                onChange={(_, value: FilterId) => setActiveFilter(value)}
                textColor="primary"
                indicatorColor="primary"
              >
                {filterTabs.map(tab => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {tab.label}
                        <Chip label={filterCounts[tab.id]} size="small" sx={{ backgroundColor: colors.status.neutralSurface }} />
                      </span>
                    }
                  />
                ))}
              </Tabs>
            </Grid>

            <Grid item xs={12} md={5}>
              <TextField
                label="Search projects or nonprofits"
                id="searchFilter"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Event"
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
              >
                <MenuItem value="all">All Events</MenuItem>
                {eventsData.map(event => (
                  <MenuItem key={event._id} value={event._id}>{event.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
              <Button variant="outlined" color="primary" onClick={handleAddProject}>
                + Add Project
              </Button>
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="projects table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Project · Nonprofit</StyledTableCell>
                    <StyledTableCell>Event</StyledTableCell>
                    <StyledTableCell>Positions</StyledTableCell>
                    <StyledTableCell>Team</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { label, theme } = statusDisplay[row.status];
                      const fillPercent = row.totalSlots > 0 ? (row.filledSlots / row.totalSlots) * 100 : 0;

                      return (
                        <TableRow hover key={row.id}>
                          <TableCell>
                            <div style={{ fontWeight: 500, color: colors.text.primary }}>{row.projectName}</div>
                            <div style={{ color: colors.text.secondary, fontSize: 14 }}>{row.nonprofitName}</div>
                          </TableCell>
                          <TableCell sx={{ color: colors.text.secondary }}>{row.eventName}</TableCell>
                          <TableCell sx={{ color: colors.text.secondary }}>
                            {row.totalPositions > 0 ? `${row.totalPositions} position${row.totalPositions === 1 ? '' : 's'}` : '—'}
                          </TableCell>
                          <TableCell sx={{ color: colors.text.secondary, minWidth: 140 }}>
                            {row.totalSlots > 0 ? (
                              <>
                                <div>{row.filledSlots} of {row.totalSlots} filled</div>
                                <LinearProgress
                                  variant="determinate"
                                  value={fillPercent}
                                  sx={{
                                    marginTop: '4px',
                                    backgroundColor: colors.status.neutralSurface,
                                    '& .MuiLinearProgress-bar': { backgroundColor: colors.status.success },
                                  }}
                                />
                              </>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <StatusChip label={label} theme={theme} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant={row.status === 'proposed' ? 'contained' : row.status === 'accepted' ? 'outlined' : 'text'}
                              size="small"
                              sx={row.status === 'proposed'
                                ? { backgroundColor: colors.primary.dark }
                                : row.status === 'accepted'
                                  ? { borderColor: colors.primary.dark, color: colors.primary.dark }
                                  : { color: colors.text.secondary }
                              }
                              onClick={() => navigate(`/projects/${row.id}`)}
                            >
                              {actionLabel[row.status]}
                            </Button>
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

export default Projects;
