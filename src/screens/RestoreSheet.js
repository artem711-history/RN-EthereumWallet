import { useRoute } from '@react-navigation/native';
import { forEach } from 'lodash';
import React, { useCallback } from 'react';
import { Alert, StatusBar } from 'react-native';
import RNCloudFs from 'react-native-cloud-fs';
import RestoreCloudStep from '../components/backup/RestoreCloudStep';
import RestoreSheetFirstStep from '../components/backup/RestoreSheetFirstStep';
import { Column } from '../components/layout';
import { SlackSheet } from '../components/sheet';
import {
  fetchUserDataFromCloud,
  isCloudBackupAvailable,
} from '../handlers/cloudBackup';
import { cloudPlatform } from '../utils/platform';
import WalletBackupStepTypes from '@rainbow-me/helpers/walletBackupStepTypes';
import WalletBackupTypes from '@rainbow-me/helpers/walletBackupTypes';
import { useDimensions } from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import logger from '~/utils/logger';

export default function RestoreSheet() {
  const { goBack, navigate, setParams } = useNavigation();
  const { height: deviceHeight } = useDimensions();
  const {
    params: {
      longFormHeight = ios ? 0 : 1,
      step = WalletBackupStepTypes.first,
      userData,
    } = {},
  } = useRoute();

  const onCloudRestore = useCallback(async () => {
    let proceed = false;
    if (android) {
      const isAvailable = await isCloudBackupAvailable();
      if (isAvailable) {
        try {
          const data = await fetchUserDataFromCloud();
          forEach(data?.wallets, wallet => {
            if (
              wallet.backedUp &&
              wallet.backupType === WalletBackupTypes.cloud
            ) {
              proceed = true;
            }
          });

          if (proceed) {
            setParams({ userData: data });
          }

          logger.log(`Downloaded ${cloudPlatform} backup info`);
        } catch (e) {
          logger.log(e);
        } finally {
          if (!proceed) {
            Alert.alert(
              'No Backups found',
              "We couldn't find any backup on Google Drive. Make sure you are logged in with the right account."
            );
            await RNCloudFs.logout();
          }
        }
      }
    } else {
      proceed = true;
    }
    if (proceed) {
      setParams({ step: WalletBackupStepTypes.cloud });
    }
  }, [setParams]);

  const onManualRestore = useCallback(() => {
    goBack();
    navigate(Routes.IMPORT_SEED_PHRASE_SHEET_NAVIGATOR);
  }, [goBack, navigate]);

  const onWatchAddress = useCallback(() => {
    goBack();
    navigate(Routes.IMPORT_SEED_PHRASE_SHEET_NAVIGATOR);
  }, [goBack, navigate]);

  const wrapperHeight = android ? deviceHeight : deviceHeight + longFormHeight;

  return (
    <Column height={wrapperHeight}>
      <StatusBar barStyle="light-content" />
      <SlackSheet contentHeight={longFormHeight} testID="restore-sheet">
        {step === WalletBackupStepTypes.cloud ? (
          <RestoreCloudStep userData={userData} />
        ) : (
          <RestoreSheetFirstStep
            onCloudRestore={onCloudRestore}
            onManualRestore={onManualRestore}
            onWatchAddress={onWatchAddress}
            userData={userData}
          />
        )}
      </SlackSheet>
    </Column>
  );
}
