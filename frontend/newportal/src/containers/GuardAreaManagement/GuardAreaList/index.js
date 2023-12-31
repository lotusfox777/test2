import * as React from 'react';
import { connect } from 'react-redux';
import { Input, Row, Col, Collapse, Spin } from 'antd';
import ListHeader from './ListHeader';
import ViewGuardArea from './ViewGuardArea';
import EditGuardArea from './EditGuardArea';
import MapModal from './MapModal';
import styled from 'styled-components';
import {
  listEnabledGuardAreas,
  updateGuardArea,
  deleteGuardArea,
  getGuardArea,
} from 'reducers/guardAreas';
import { listCardGroups } from 'reducers/cardGroups';
import { listCards } from 'reducers/cards';
import { withI18next } from 'locales/withI18next'

const Search = Input.Search;
const Panel = Collapse.Panel;

const StyleDescWrap = styled(Row)`
  line-height: 1.5;
  color: #79abe5;
  margin: 25px 0px 5px 0px;

  div {
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StyleCollapseHeader = styled(Row)`
  margin: 40px 0px 5px 0px;
  line-height: 1.5;
  color: #4a4a4a;
  width: 80%;

  .padding-left-17 {
    padding-left: 17px;
  }
`;

const StyleCollapsContent = styled(Row)`
  width: 80%;
  margin-bottom: 24px;

  .ant-collapse > .ant-collapse-item > .ant-collapse-header {
    height: 46px;
    padding: 12px 0 12px 17px;
  }
  .ant-collapse-content {
    background-color: #fafafa;
  }
`;

const H2 = styled.h2`
  small {
    color: ${p => p.theme.greyishbrown};
    margin-left: 10px;
    font-size: 14px;
  }
`;

const StyledCollapse = styled(Collapse)`
  .ant-collapse-header .arrow {
    left: 95% !important;
  }

  > .ant-collapse-item > .ant-collapse-header .arrow:before {
    content: '\\E61E' !important;
  }

  > .ant-collapse-item
    > .ant-collapse-header[aria-expanded='true']
    .arrow:before {
    content: '\\E61F' !important;
  }
`;

@connect(
  state => ({
    guardAreas: state.guardAreas,
    allCards: state.cards.content,
    allCardGroups: state.cardGroups.content,
    users: state.users,
  }),
  {
    listEnabledGuardAreas,
    listCards,
    listCardGroups,
    updateGuardArea,
    getGuardArea,
    deleteGuardArea,
  },
)
class GuardAreaList extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      guardAreaType: 'sys',
      currentExpandedId: String(Object.keys(props.guardAreas.byId)[0]),
      editContext: {},
      mapModalVisible: false,
      currentMode: 'view',
    };
  }

  componentDidMount = () => {
    this.props.listEnabledGuardAreas();
    this.props.listCards({ size: 9999 });
    this.props.listCardGroups({ size: 9999 });
  };

  handleClickTab = guardAreaType => () => {
    this.setState({ guardAreaType });
  };

  handleMapModalVisible = currentMode => {
    if (!currentMode) {
      // come back from editing guard area range
      this.props.listEnabledGuardAreas();
    }
    this.setState({
      currentMode,
      mapModalVisible: !this.state.mapModalVisible,
    });
  };

  handleOk = values => {
    this.props.updateGuardArea(values);
    this.setState(prevState => ({
      ...prevState,
      editContext: {
        ...prevState.editContext,
        [values.id]: undefined,
      },
    }));
  };

  handleCancel = id => {
    this.setState(prevState => ({
      ...prevState,
      editContext: {
        ...prevState.editContext,
        [id]: undefined,
      },
    }));
  };

  handleDelete = id => {
    this.props.deleteGuardArea(id);
  };

  handleChangeEnable = item => () => {
    this.props.updateGuardArea({
      id: item.id,
      guardareaEnable: !item.guardareaEnable,
    });
  };

  handleSearch = search => {
    this.props.listEnabledGuardAreas({ search });
  };

  handleCollapse = id => {
    this.props.getGuardArea(id);

    this.setState({ currentExpandedId: id });
  };

  handleEdit = item => () => {
    this.setState(prevState => ({
      ...prevState,
      editContext: {
        ...prevState.editContext,
        [item.id]: item,
      },
    }));
  };

  handleListChange = pagination => {
    console.log(pagination);
  };

  render() {
    const {
      editContext,
      currentExpandedId,
      mapModalVisible,
      currentMode,
      guardAreaType,
    } = this.state;
    const {
      guardAreas,
      allCards = [],
      allCardGroups = [],
      users: { currentUser },
      t,
    } = this.props;

    const content =
      guardAreaType === 'sys'
        ? guardAreas.sysGuardArea
        : guardAreas.customGuardArea;

    return (
      <React.Fragment>
        <H2>
          {t('geo-fence list')}
          {/* <small>列出系統及自訂的守護區域 (自訂區域至多5個)</small> */}
        </H2>
        <StyleDescWrap>
          <Col span={4} onClick={this.handleClickTab('sys')}>
            {t('default')} ({guardAreas.sysGuardAreaCount})
          </Col>
          <Col span={4} onClick={this.handleClickTab('custom')}>
            {t('customize')} ({guardAreas.customGuardAreaCount})
          </Col>
        </StyleDescWrap>
        <Row>
          <Col span={9}>
            <Search placeholder={t('id or name')} onSearch={this.handleSearch} />
          </Col>
        </Row>
        <StyleCollapseHeader>
          <Col span={8} className="padding-left-17">
            {t('name')}
          </Col>
          <Col span={8}>{t('range')}</Col>
          <Col span={8}>{t('status')}</Col>
        </StyleCollapseHeader>
        <StyleCollapsContent>
          <Col lg={24} sm={24} xs={24} md={24}>
            <Spin spinning={guardAreas.isLoading}>
              <StyledCollapse
                accordion
                onChange={this.handleCollapse}
                defaultActiveKey={currentExpandedId}>
                {content.map(item => (
                  <Panel
                    header={<ListHeader guardArea={item} />}
                    key={item.id}
                    style={{ backgroundColor: '#fff' }}>
                    {(() => {
                      if (editContext[item.id]) {
                        return (
                          <EditGuardArea
                            guardArea={editContext[item.id]}
                            allCardGroups={allCardGroups}
                            allCards={allCards}
                            onOk={this.handleOk}
                            onCancel={this.handleCancel}
                            onDelete={this.handleDelete}
                            onEditRange={() =>
                              this.handleMapModalVisible('edit')
                            }
                          />
                        );
                      }

                      const disableEdit =
                        guardAreaType === 'sys' &&
                        (currentUser &&
                          currentUser.roles[0].name !== 'ROLE_ADMIN');
                      return (
                        <Spin spinning={guardAreas.isLoadingGuardArea}>
                          <ViewGuardArea
                            guardArea={
                              guardAreas.byId[item.id]
                                ? guardAreas.byId[item.id]
                                : item
                            }
                            onDelete={this.handleDelete}
                            onClickEdit={this.handleEdit}
                            onChangeEnable={this.handleChangeEnable}
                            onViewRange={() =>
                              this.handleMapModalVisible('view')
                            }
                            disableEdit={disableEdit}
                          />
                        </Spin>
                      );
                    })()}
                  </Panel>
                ))}
              </StyledCollapse>
            </Spin>
          </Col>
        </StyleCollapsContent>

        {mapModalVisible && (
          <MapModal
            readOnly={currentMode === 'view'}
            onClose={this.handleMapModalVisible}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withI18next(['all'])(GuardAreaList)
