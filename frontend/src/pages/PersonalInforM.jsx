import React, { useState } from 'react';
import { Form, Input, Button, message, Upload, Select } from 'antd';
import { PlusOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useUser from '../hooks/useUser';
import request from '../utils/request';
import { FullScreenContainer } from '../styled';
import { getToken } from '../utils/index';
export default function PersonalInforM () {
  const { TextArea } = Input;
  const navigate = useNavigate();
  const { getId } = useUser();
  const id = getId();
  const [filelist, setFilelist] = useState([]);
  // eslint-disable-next-line prefer-const
  const [previewImage, setPreviewImage] = useState('')
  const [previewVisible, setPreviewVisible] = useState(false)
  // interaction
  const onFinish = (values) => {
    request('/users/' + id, {
      method: 'PATCH',
      data: values
    }).then(data => {
      console.log(data)
      if (data.message) {
        // deal error
        if (data.message.password) {
          if (data.message.password.includes('password not strong enough')) {
            message.error('password not strong enough');
            location.hash = 'register';
          } else {
            message.error(data.error, 'error');
          }
        } else if (data.message.username) {
          if (data.message.username.includes('Please use another name')) {
            message.error('Duplicate username');
            location.hash = 'register';
          } else if (data.message.username.includes('invalid character')) {
            message.error('username contains invalid character');
            location.hash = 'register';
          } else {
            message.error(data.error, 'error');
          }
        }
        return;
      }
      if (filelist.length !== 0) {
        const formData = new FormData();
        formData.append('avatar', filelist[0].originFileObj)
        reciper(formData)
      }
      console.log(values.password)
      if (values.password) {
        message.success('Successfully modified the password, plz login again');
        localStorage.removeItem('user');
        localStorage.removeItem('user_token');
        localStorage.removeItem('id');
        navigate('/login');
      } else {
        message.success('Successfully modified the username');
        navigate('/');
      }
    });
  };
  // eslint-disable-next-line prefer-const
  let token = ''
  function reciper (form) {
    fetch('http://127.0.0.1:5000/users/avatar', {
      method: 'POST',
      body: form,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
        processData: false
      },
    }).then(data => {
      message.success('Successfully modified the avatar');
      // localStorage.removeItem('user');
      // localStorage.removeItem('user_token');
      // localStorage.removeItem('id');
      navigate('/');
    });
  }
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );
  const handlePreview = (file) => {
    setPreviewImage(file.thumbUrl)
    setPreviewVisible(true)
  };
  const handleChange = ({ fileList: newFileList }) => {
    setFilelist(newFileList);
  };
  return (
    <FullScreenContainer>
      <Form
        style={{ width: 600 }}
        name="basic"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 10 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <h1 style = {{ fontSize: 30, paddingLeft: 50, paddingBottom: 30 }}>Update My Information</h1>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: false, message: 'Please input your new name!' }]}
        >
          <Input placeholder="Please input your new Username!"/>
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: false, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" />
        </Form.Item>
        <Form.Item
          label="Gender"
          name="gender"
        >
          <Select
            showSearch
            placeholder="Select gender"
            optionFilterProp="children"
            options={[
              {
                value: 'male',
                label: 'Male',
              },
              {
                value: 'female',
                label: 'Female',
              },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Real Name"
          name="name"
        >
          <Input placeholder="Please input your new name!"/>
        </Form.Item>
        <Form.Item
          label="Introduction"
          name="introduction"
        >
          <TextArea rows={3} placeholder="maxLength is 30" maxLength={30} />
        </Form.Item>
        <Form.Item
            label="Avatar"
            name="files"
            valuePropName="fileList"
            getValueFromEvent={e => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload
              listType="picture-card"
              fileList={filelist}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
            >
              {filelist.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
          <Form.Item style = {{ paddingLeft: 125 }}>
            <Button type="primary" htmlType="submit" style = {{ width: 200 }}>
              Submit
            </Button>
          </Form.Item>
      </Form>
    </FullScreenContainer>
  );
}
