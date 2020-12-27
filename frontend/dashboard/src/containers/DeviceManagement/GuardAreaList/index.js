import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Layout, Row, Col, Table, Input } from 'antd';
import Button from 'components/Button';
import {
  listGuardAreas,
  listGuardAreaUFOs,
  updateGuardAreaUFOs,
  updateGuardArea
} from 'reducers/guardAreas';
import { FORM_FIELDS } from 'constants/formFields';
import EditGuardAreaModal from './EditGuardAreaModal';
import MapGuardAreaModal from './MapGuardAreaModal';
import ConfirmGuardAreaModal from './ConfirmGuardAreaModal';

const Search = Input.Search;

const { Content } = Layout;

const mapStateToProps = state => ({
  guardAreas: state.guardAreas
});

const mapDispatchToProps = {
  listGuardAreas,
  listGuardAreaUFOs,
  updateGuardAreaUFOs,
  updateGuardArea
};

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class GuardAreaList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapModalVisible: false,
      editModalVisible: false,
      confirmModalVisible: false,
      gettingUFOs: false,
      editingGuardArea: undefined,
      newUFOs: [],
      newCenter: {}
    };
  }

  handleEditModalVisible = editingGuardArea => {
    this.setState({
      editingGuardArea,
      editModalVisible: !this.state.editModalVisible
    });
  };

  handleMapModalVisible = () => {
    this.setState({
      editingGuardArea: undefined,
      mapModalVisible: !this.state.mapModalVisible
    });
  };

  handleListUFOs = editingGuardArea => {
    this.props.listGuardAreaUFOs({
      body: {
        id: editingGuardArea.id
      },
      page: 0,
      size: 99999
    });

    this.setState({
      gettingUFOs: true,
      editingGuardArea
    });
  };

  handleUpdateGuardArea = (ufoSeqs, lat, lng) => {
    const {
      editingGuardArea: { id, name, guardareaEnable }
    } = this.state;

    this.props.updateGuardAreaUFOs({
      id,
      ufoSeqs
    });
    this.props.updateGuardArea({
      id,
      guardareaEnable,
      name,
      positionLatitude: lat,
      positionLongitude: lng
    });
  };

  handlePagination = pagination => {
    this.props.listGuardAreas({
      page: pagination.current - 1,
      body: this.props.guardAreas.body
    });
  };

  handleSearch = search => {
    this.props.listGuardAreas({
      body: { input: search },
      page: 0
    });
  };

  handleConfirmModalVisible = (ufoSeqs, lat, lng) => {
    this.setState({
      newUFOs: ufoSeqs,
      newCenter: {
        lat,
        lng
      },
      confirmModalVisible: !this.state.confirmModalVisible
    });
  };

  componentDidUpdate(prevProps) {
    const {
      guardAreas: { isLoading }
    } = this.props;
    const { gettingUFOs } = this.state;

    if (gettingUFOs && !isLoading) {
      this.setState({
        gettingUFOs: false,
        mapModalVisible: true
      });
    }
  }

  componentDidMount() {
    this.props.listGuardAreas();
  }

  render() {
    const {
      editModalVisible,
      mapModalVisible,
      editingGuardArea,
      newUFOs,
      confirmModalVisible,
      newCenter
    } = this.state;
    const {
      guardAreas: { totalPages, content, page, isLoading, ufos }
    } = this.props;

    const columns = [
      {
        title: '守護區域ID',
        dataIndex: 'id'
      },
      {
        title: '守護區域名稱',
        dataIndex: 'name'
      },
      {
        title: '啟用狀態',
        dataIndex: 'guardareaEnable',
        render: guardareaEnable => (
          <span>{guardareaEnable ? '啟用中' : '停用中'}</span>
        )
      },
      {
        title: 'UFO數量',
        dataIndex: 'ufoCount'
      },
      {
        title: '',
        dataIndex: '',
        render: (_, area) => {
          return (
            <span>
              <Button
                icon="edit"
                style={{ marginRight: 6 }}
                actionTypes={FORM_FIELDS.EDITABLE}
                onClick={() => this.handleEditModalVisible(area)}
              />
              <Button
                icon="environment"
                actionTypes={FORM_FIELDS.READABLE}
                onClick={() => this.handleListUFOs(area)}
              />
            </span>
          );
        }
      }
    ];

    const pagination = {
      current: page + 1,
      pageSize: 10,
      total: 10 * totalPages
    };

    const mapModalProps = {
      guardArea: editingGuardArea,
      ufos: editingGuardArea ? ufos : [],
      onOk: editingGuardArea
        ? this.handleUpdateGuardArea
        : this.handleConfirmModalVisible,
      onClose: this.handleMapModalVisible,
      title: editingGuardArea ? '觀看區域地圖' : '新增守護區域',
      isViewMode: editingGuardArea
    };

    return (
      <Layout>
        <Content style={{ padding: '0px 24px 0px 8px' }}>
          <h1>裝置管理 > 守護區域管理</h1>

          <Row style={{ marginBottom: 15 }}>
            <Col span={16}>
              <Search
                placeholder="輸入守護區域資訊"
                onSearch={this.handleSearch}
                style={{ width: 250 }}
              />
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Button
                onClick={this.handleMapModalVisible}
                actionTypes={FORM_FIELDS.EDITABLE}
              >
                新增守護區域
              </Button>
            </Col>
          </Row>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={content}
            pagination={pagination}
            loading={isLoading}
            onChange={this.handlePagination}
            locale={{ emptyText: '沒有資料。' }}
          />

          {editModalVisible && (
            <EditGuardAreaModal
              guardArea={editingGuardArea}
              onClose={this.handleEditModalVisible}
            />
          )}
          {mapModalVisible && <MapGuardAreaModal {...mapModalProps} />}
          {confirmModalVisible && (
            <ConfirmGuardAreaModal
              ufos={newUFOs}
              newCenter={newCenter}
              onClose={this.handleConfirmModalVisible}
            />
          )}
        </Content>
      </Layout>
    );
  }
}

export default GuardAreaList;
