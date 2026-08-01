import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
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
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

import { useAppSelector } from '../../../store/hooks';
import { selectAllNonprofits } from '../../../store/nonprofitsSlice';
import { selectAllProjects } from '../../../store/projectsSlice';
import { loadNonprofits } from '../../../services/nonprofit';
import { loadProjects } from '../../../services/project';
import { NonprofitStatus } from '../../../types/nonprofit';
import PageLayout from '../../../layouts/PageLayout';
import StatusChip, { StatusChipTheme } from '../../../components/elements/StatusChip';
import { colors } from '../../../material/colors';

type FilterId = 'interested' | 'archived' | 'accepted' | 'all';

const filterTabs: { id: FilterId, label: string }[] = [
  { id: 'interested', label: 'Interested' },
  { id: 'archived', label: 'Archived' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'all', label: 'All' },
];

const statusDisplay: Record<NonprofitStatus, { label: string, theme: StatusChipTheme }> = {
  interested: { label: 'Interested', theme: 'teal' },
  accepted: { label: 'Accepted', theme: 'success' },
  archived: { label: 'Archived', theme: 'neutral' },
};

type Row = {
  id: string;
  organization: string;
  contact: string;
  requestedProject: string;
  submitted?: string;
  status: NonprofitStatus;
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

const formatSubmittedDate = (isoDate?: string) => {
  if (!isoDate) { return ''; }
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const Nonprofits = () => {
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();

  const nonprofitsData = useAppSelector(selectAllNonprofits);
  const projectsData = useAppSelector(selectAllProjects);

  useEffect(() => {
    loadNonprofits();
    loadProjects();
  }, []);

  const rows: Row[] = useMemo(() => {
    // Each nonprofit gets one row; if it has an associated project (or several),
    // show its most-recently-submitted one alongside it.
    return nonprofitsData.map(nonprofit => {
      const nonprofitProjects = projectsData
        .filter(p => p.nonprofit === nonprofit._id)
        .sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''));
      const project = nonprofitProjects[0];

      return {
        id: nonprofit._id,
        organization: nonprofit.name,
        contact: nonprofit.contactName,
        requestedProject: project?.name ?? '—',
        submitted: nonprofit.createdDate,
        status: nonprofit.status,
      };
    });
  }, [nonprofitsData, projectsData]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterId, number> = { interested: 0, archived: 0, accepted: 0, all: rows.length };
    for (const row of rows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = activeFilter === 'all' ? rows : rows.filter(r => r.status === activeFilter);

    if (filter) {
      const searchVal = filter.toLocaleLowerCase();
      result = result.filter(r =>
        r.organization.toLocaleLowerCase().includes(searchVal)
        || r.contact.toLocaleLowerCase().includes(searchVal)
        || r.requestedProject.toLocaleLowerCase().includes(searchVal)
      );
    }

    return result;
  }, [rows, activeFilter, filter]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleAddManually = () => {
    navigate('/nonprofits/new');
  };

  return (
    <PageLayout>
      <div className="fullViewContainer">
        <div className="gutters">
          <h1 style={{ textAlign: 'center', color: colors.teal.main }}>
            Nonprofits
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

            <Grid item xs={8} md={9}>
              <TextField
                label="Search organizations or projects"
                id="searchFilter"
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={4} md={3} sx={{ textAlign: 'right' }}>
              <Button variant="outlined" color="primary" onClick={handleAddManually}>
                + Add Manually
              </Button>
            </Grid>
          </Grid>

          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="nonprofits table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Organization</StyledTableCell>
                    <StyledTableCell>Contact</StyledTableCell>
                    <StyledTableCell>Requested Project</StyledTableCell>
                    <StyledTableCell>Submitted</StyledTableCell>
                    <StyledTableCell>Status</StyledTableCell>
                    <StyledTableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => {
                      const { label, theme } = statusDisplay[row.status];
                      const isNew = row.status === 'interested';

                      return (
                        <TableRow hover key={row.id}>
                          <TableCell>{row.organization}</TableCell>
                          <TableCell sx={{ color: colors.text.secondary }}>{row.contact}</TableCell>
                          <TableCell sx={{ color: colors.text.secondary }}>{row.requestedProject}</TableCell>
                          <TableCell sx={{ color: colors.text.secondary }}>{formatSubmittedDate(row.submitted)}</TableCell>
                          <TableCell>
                            <StatusChip label={label} theme={theme} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant={isNew ? 'contained' : 'outlined'}
                              size="small"
                              sx={isNew
                                ? { backgroundColor: colors.primary.dark }
                                : { borderColor: colors.primary.dark, color: colors.primary.dark }
                              }
                              onClick={() => navigate(`/nonprofits/${row.id}`)}
                            >
                              {isNew ? 'Review' : 'Open'}
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

export default Nonprofits;
