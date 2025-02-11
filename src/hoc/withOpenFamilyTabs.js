import { connect } from 'react-redux';
import {
  pushOpenFamilyTab,
  setOpenFamilyTabs,
} from '~/redux/reducers/openStateSettings';

const mapStateToProps = ({ openStateSettings: { openFamilyTabs } }) => ({
  openFamilyTabs,
});

export default Component =>
  connect(mapStateToProps, {
    pushOpenFamilyTab,
    setOpenFamilyTabs,
  })(Component);
