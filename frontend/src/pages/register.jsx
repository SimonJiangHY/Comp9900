import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import { FullScreenContainer } from '../styled';

export default function Register () {
  const navigate = useNavigate();
  // interaction
  const onFinish = (values) => {
    console.log('Success:', values);
    request('/users', {
      method: 'post',
      data: values
    }).then(data => {
      const user = {
        email: values.email,
        name: values.name,
      }
      console.log(data.message)
      if (data.message) {
        // deal token error
        if (data.message.password) {
          if (data.message.password.includes('password not strong enough')) {
            message.error('password not strong enough');
            location.hash = 'register';
          } else {
            message.error(data.error, 'error');
          }
        } else if (data.message.email) {
          if (data.message.email.includes('Duplicate email')) {
            message.error('Duplicate email');
            location.hash = 'register';
          } else {
            message.error(data.error, 'error');
          }
        } else if (data.message.username) {
          if (data.message.username.includes('Duplicate username')) {
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
      message.success('registe success,please login in');
      navigate('/login');
    });
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  function goLoginPage () {
    navigate('/login');
  }

  return (
    <FullScreenContainer>
      <Form
        style={{ width: 400 }}
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'The input is not valid E-mail!' },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
          <Button type="link" onClick={goLoginPage}>
            login
          </Button>
        </Form.Item>
      </Form>
    </FullScreenContainer>
  );
}
