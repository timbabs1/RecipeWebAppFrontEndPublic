import React from 'react';
//import './Card.css';
//import './tooltip.css';
import FontAwesome from 'react-fontawesome';
import { Card, Col, Row} from 'antd'

import { Upload, message, Popconfirm, Form, Input, Icon, Button, Alert, Pagination, Modal } from 'antd';
import { InputNumber } from 'antd';
import { ANT_MARK } from 'antd/lib/locale-provider';
import { isFlowBaseAnnotation } from '@babel/types';

let id = 0;
const { Meta } = Card;

const text = 'Are you sure to delete this ingredient?';

  class IngredientDeck extends React.Component {
    async getBase64(img, callback) {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img)
      }
    constructor(props){
        super(props)
        this.state = {
          visible: false,
          disabled: true,
          ingredientUpdatedSuccessfully: false,
          ingredientDeletedSuccessfully: false,
          showSuccess: false,
          showDeleteSuccess: false,
          text: "Enable Edit Mode"
        }
        this.handleDelete = this.handleDelete.bind(this);
    }
    showModal = () => {
      this.setState({
        visible: true,
      });
    };

    handleCancel = () => {
        this.setState({ visible: false });
      };

    handleOk = e => {
      console.log(e);
      this.setState({
        visible: false,
      });
    };
    handleGameClik() {
        this.setState( {disabled: !this.state.disabled} )
        if (this.state.disabled === false){
            this.state.text = "Enable Edit Mode"
        } else {
            this.state.text = "Disable Edit Mode"
        }
      };
      handleSubmit = e => {
          e.preventDefault();
          this.props.form.validateFields((err, values) => {
              if (!err){
                  let ingredientId=  this.props.Id
                  if (!this.state.imageUrl){
                    return  message.error("Number of Images must match number of ingredient with image 1 for ingredient 1 ");
                  }
                  console.log(values)
                  Object.assign(values, {imageUrl: this.state.imageUrl})
                fetch(`http://localhost:3000/api/v1.0/ingredient/${ingredientId}`,{
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + window.btoa(this.props.username + ':' + this.props.password),
                    },
                    body: JSON.stringify({values})
                }).then(res => {
                    if(res.ok){
                        this.setState({ingredientUpdatedSuccessfully:true})
                        this.setState({showSuccess:true})
                        return res.json()
                    }else {
                        console.log(res.status)
                        this.setState({
                            ingredientUpdatedSuccessfully:false,
                            errorCode: res.status,
                            errorMessage: res.statusText,
                            showSuccess: false 
                        });
                        return res.json()
                    }
                    })
              }
          })
      }
      handleDelete() {
          let ingredientId = this.props.Id
          console.log(ingredientId)
          fetch(`http://localhost:3000/api/v1.0/ingredient/${ingredientId}`,{
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + window.btoa(this.props.username + ':' + this.props.password),
                    }
        }).then(res => {
            if(res.ok){
                this.setState({ingredientDeletedSuccessfully:true})
                this.setState({showDeleteSuccess:true})
                return res.json()
            }else {
                console.log(res.status)
                this.setState({
                    ingredientDeletedSuccessfully:false,
                    errorCode: res.status,
                    errorMessage: res.statusText,
                    showDeleteSuccess: false 
                });
                return res.json()
            }
            })
            
      }
      beforeUpload(file) {
        const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
            message.error("You can only upload JPG/PNG file!");
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
            message.error("Image must smaller than 2MB!");
            }
            return isJpgOrPng && isLt2M;
        }

        handleChange = info => {
          if (info.file.status === 'uploading') {
            this.getBase64(info.file.originFileObj, imageUrl => {
              this.setState({imageUrl})
            })
          }
          if (info.file.status === 'done'){
            this.getBase64(info.file.originFileObj, imageUrl => {
              this.setState({imageUrl})
            })
          
        }
      }

    render() {
        const uploadButton = (
            <div>
              <Icon type={this.state.loading ? 'loading' : 'plus'} />
              <div className="ant-upload-text">Upload</div>
            </div>
          );
        const { imageUrl } = this.state;
        const { getFieldDecorator } = this.props.form;
        //reference to the meta component of the card
        let Meta = Card.Meta
        //Customise the ant-design card component
        return <div><Card  type="inner" title={this.props.title} style={{ width: '100%'}}
                  cover={<img alt="example" src={this.props.mainImageURL} style={{ height: 320}} />}
                  actions={[
                    <Icon type="edit" key="edit" onClick={this.showModal} />,
                    <Popconfirm placement="topLeft" title={text} onConfirm={this.handleDelete} okText="Yes" cancelText="No">
                    <Icon type="delete" key="delete" /></Popconfirm>,
                  ]}
                  >
                   Description: {this.props.description} <br></br>
                   Quantity: {this.props.quantity}
                    <Meta
                    description
                    className="This is the description"
                  />
        </Card>
        <Modal
        title="Ingredient Modal"
        visible={this.state.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        footer={null}
        >
            <div>
            <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            beforeUpload={this.beforeUpload}
            onChange={this.handleChange}
            >
            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
            <Form onSubmit={this.handleSubmit} align="center">
                <Form.Item label="Title" hasFeedback>
                    {getFieldDecorator('title', {
                        initialValue: this.props.title,
                        rules: [
                            {
                                required: true,
                                message: 'Enter new title',
                            },
                        ],
                    })(<Input addonBefore="Title" disabled={(this.state.disabled)? true : false} />)}
                </Form.Item>
                <Form.Item label="Description" hasFeedback>
                    {getFieldDecorator('description', {
                        initialValue: this.props.description,
                        rules: [
                            {
                                required: true,
                                message: 'Enter new description',
                            },
                        ],
                    })(<Input addonBefore="Description" disabled={(this.state.disabled)? true : false} />)}
                </Form.Item>
                <Form.Item label="Quantity" hasFeedback>
                    {getFieldDecorator('quantity', {
                        initialValue: this.props.quantity,
                        rules: [
                            {
                                required: true,
                                message: 'Enter new quantity',
                            },
                        ],
                    })(<InputNumber addonBefore="Quantity" disabled={(this.state.disabled)? true : false} />)}
                </Form.Item>
               
                {this.state.showSuccess ? <Alert message="Ingredient updated successfully" type="success" /> :null}
                {this.state.showError ? <Alert message={"Error code " + this.state.errorCode + " " + this.state.errorMessage} type="error" /> :null}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Update
                    </Button>
                    <Button  onClick = {this.handleGameClik.bind(this)}> {this.state.text}  </Button>
                    {this.state.showDeleteSuccess ? <Alert message="Ingredient deleted successfully" type="success" /> :null}
                    {this.state.showError ? <Alert message={"Error code " + this.state.errorCode + " " + this.state.errorMessage} type="error" /> :null}
                </Form.Item>
                </Form>
                </div>
                
      </Modal>
      </div>
    }
}

const IngredientCard = Form.create({ name: 'IngredientCard' })(IngredientDeck);
export default IngredientCard;