import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import useUser from '../hooks/useUser';
import { FullScreenContainer } from '../styled';
import Base64 from 'base-64';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
export default function Demo () {
  const navigate = useNavigate();
  const { saveUser, saveToken, saveId } = useUser();
  // interaction
  const onFinish = (values) => {
    const base = 'Basic ' + Base64.encode(values.email + ':' + values.password);
    request('/login', {
      method: 'post',
      data: values,
      author: base
    }).then(data => {
      const user = {
        email: values.email,
      }
      if (data.error) {
        // deal token error
        if (data.error.includes('invalid token')) {
          message.error('token expired, please login');
          location.hash = 'login';
        } else if (data.error.includes('Unauthorized')) {
          message.error('error name or password');
          location.hash = 'login';
        } else {
          message.error(data.error, 'error');
        }
        return;
      }
      saveUser(user);
      saveToken(data.token);
      saveId(data.id);
      message.success('Login succeeded');
      navigate('/');
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  function goRegisterPage () {
    navigate('/register');
  }

  return (
    <FullScreenContainer>
      <Form
        style={{ width: 350 }}
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item>
          <p style={{ fontSize: '3em', textAlign: 'center' }}>Welcome </p>
          <p style={{ fontSize: '1em', textAlign: 'center' }}>Log in to your account </p>
        </Form.Item>
        <Form.Item
          label=""
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'The input is not valid E-mail!' },
          ]}
        >
          <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
        </Form.Item>
        <Form.Item
          label=""
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="Password" />
        </Form.Item>
        <Form.Item >
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
          Or <a href="" onClick={goRegisterPage}>register now!</a>
        </Form.Item>
      </Form>
    </FullScreenContainer>
  );
}
