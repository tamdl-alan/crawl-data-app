import {
  // mdiAccountCircle,
  mdiMonitor,
  // mdiGithub,
  // mdiLock,
  // mdiAlertCircle,
  // mdiSquareEditOutline,
  mdiTable,
  mdiDelete,
  // mdiViewList,
  // mdiTelevisionGuide,
  // mdiResponsive,
  // mdiPalette,
  // mdiReact,
} from '@mdi/js'

export default [
  {
    to: '/dashboard',
    icon: mdiMonitor,
    label: 'Dashboard',
  },
  // {
  //   to: '/tables',
  //   label: 'Tables',
  //   icon: mdiTable,
  // },
  {
    to: '/products',
    label: 'Products',
    icon: mdiTable,
  },
  {
    to: '/crawled-data',
    label: 'Crawled Data',
    icon: mdiTable,
  },
  {
    to: '/deleted-products',
    label: 'Deleted Products',
    icon: mdiDelete,
  },
  // {
  //   to: '/forms',
  //   label: 'Forms',
  //   icon: mdiSquareEditOutline,
  // },
]
