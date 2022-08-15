import React, { useEffect, useState } from 'react';

import { useAppSelector } from '../../../store/hooks';
import { users, profiles } from '../../../store/usersSlice';
import { User } from '../../../types/user';
import { Profile } from '../../../types/profile';
import { getUsersData, getProfilesData, exportUsersAndProfilesData } from '../../../services/users';

import PageLayout from '../../../layouts/PageLayout';
import StandardButton from '../../../components/buttons/StandardButton';

type UserProfileRow = {
  user: User,
  profile: Profile
};

const Users = () => {
  const [userProfileRows, setUserProfileRows] = useState<UserProfileRow[]>([]);
  const [processing, setProcessing] = useState(false);

  const usersData = useAppSelector(users);
  const profilesData = useAppSelector(profiles);

  // load data onn first visit
  useEffect(() => {
    // getUsersData();
    // getProfilesData();
  }, []);

  // create rows from userProfile
  useEffect(() => {
    if (!usersData) { return; }
    const rowData: UserProfileRow[] = [];
    const profilesDict: {[key: string]: Profile} = {};

    if (profilesData) {
      for (const profile of profilesData) {
        profilesDict[profile.userId] = profile;
      }
    }

    for (const user of usersData) {
      const row = {
        user,
        profile: profilesDict[user._id]
      } as UserProfileRow;

      rowData.push(row);
    }

    setUserProfileRows(rowData);
  }, [usersData, profilesData]);

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

  const userRows = userProfileRows.map((userProfile, i) => {
    return (<tr key={userProfile.user._id}>
      <td>{i + 1}</td>
      <td>{userProfile.user?.userRole}</td>
      <td>{userProfile.user?.name}</td>
      <td>{userProfile.user?.email}</td>
      <td>{userProfile.profile?.teamLeadCandidate ? 'Yes' : 'No'}</td>
      <td>{userProfile.profile?.skills?.length ? 'Yes' : 'No'}</td>
    </tr>);
  });

  // TODO: add table of users
  return (
    <PageLayout>
      <div className="viewContainer">
        <div className="gutters">
          <h1>
            Users
          </h1>

          <StandardButton
            label="Download all users"
            handler={handleButton}
            disabled={processing}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default Users;