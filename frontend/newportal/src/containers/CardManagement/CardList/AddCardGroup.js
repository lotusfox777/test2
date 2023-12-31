import * as React from 'react';
import styled from 'styled-components';
import { Row, Input, Form, Select } from 'antd';
import { find, propEq } from 'ramda';
import StyleButton from 'components/Button';
import BasicModal from 'components/BasicModal';
import { withI18next } from 'locales/withI18next'

const FormItem = styled(Form.Item)`
  .ant-form-item-required:before {
    display: none;
  }

  .ant-form-item-label {
    text-align: left;
  }
`;

const StyledRow = styled(Row)`
  padding-left: 14px;

  &.mb0 {
    margin-bottom: 0px;
  }
`;

const formItemLayout = {
  labelCol: {
    span: 5
  },
  wrapperCol: {
    span: 18
  }
};

@Form.create()
class AddCardGroup extends React.PureComponent {
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
        return;
      }

      const cardGroup = { groupName: values.groupName };

      cardGroup.cardInfos = values.cardInfos.map(id => {
        const card = find(propEq('id', +id))(this.props.allCards);
        return {
          uuid: card.uuid,
          major: card.major,
          minor: card.minor
        };
      });

      this.props.onSubmit(cardGroup);
    });
  };

  render() {
    const {
      onClose,
      allCards,
      form: { getFieldDecorator },
      t
    } = this.props;

    return (
      <BasicModal
        title={t('create group')}
        visible={true}
        onOk={this.handleSave}
        onCancel={onClose}>
        <Form>
          <StyledRow className="mb0">
            <FormItem {...formItemLayout} label={t('group name')}>
              {getFieldDecorator('groupName', {
                rules: [{ required: true, message: '此欄位必填' }]
              })(<Input placeholder={t('group name')} />)}
            </FormItem>
          </StyledRow>
          <StyledRow>
            <FormItem {...formItemLayout} label={t('list')}>
              {getFieldDecorator('cardInfos', {
                rules: [{ required: true, message: '請至少選擇一個守護名單' }],
                initialValue: []
              })(
                <Select mode="multiple" placeholder="選取守護名單">
                  {allCards.map(x => (
                    <Select.Option key={x.id} value={String(x.id)}>
                      {x.cardName}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </StyledRow>
          <div className="footer">
            <StyleButton
              type="white"
              key="cancel"
              text={t('cancel')}
              style={{ marginRight: '9px' }}
              onClick={onClose}
            />
            <StyleButton key="save" text={t('create')} onClick={this.handleSave} />
          </div>
        </Form>
      </BasicModal>
    );
  }
}

export default withI18next(['all'])(AddCardGroup);
