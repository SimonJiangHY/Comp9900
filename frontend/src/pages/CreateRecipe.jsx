/* eslint-disable multiline-ternary */
import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Upload, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { FullScreenContainer } from '../styled';
import useUser from '../hooks/useUser';
import request from '../utils/request';
import { getToken } from '../utils/index';
export default function CreateRecipe () {
  const navigate = useNavigate();
  let ingredientall = ''
  let mealTypeall = ''
  const [filelist, setFilelist] = useState([]);
  // eslint-disable-next-line prefer-const
  let rid = ''
  const [previewImage, setPreviewImage] = useState('')
  const [previewVisible, setPreviewVisible] = useState(false)
  // eslint-disable-next-line react/no-direct-mutation-state
  const handlePreview = (file) => {
    setPreviewImage(file.thumbUrl)
    setPreviewVisible(true)
  };
  const handleChange = ({ fileList: newFileList }) => {
    setFilelist(newFileList);
  };
  // interaction
  const onFinish = (values) => {
    // const { fileList } = this.state;
    // eslint-disable-next-line prefer-const
    const formData = new FormData();
    formData.append('photo', filelist[0].originFileObj)
    ingredientall = ''
    mealTypeall = ''
    values.main_ingredients.forEach(element => {
      if (ingredientall === '') {
        ingredientall = element
      } else { ingredientall = ingredientall + ',' + element }
    });
    values.meal_type.forEach(element => {
      if (mealTypeall === '') {
        mealTypeall = element
      } else { mealTypeall = mealTypeall + ',' + element }
    });
    // eslint-disable-next-line prefer-const
    let token = ''
    // console.log('Success:', values);
    request('/recipes', {
      method: 'post',
      data: {
        description: values.description,
        method: values.method,
        recipe_name: values.recipe_name,
        meal_type: mealTypeall,
        main_ingredients: ingredientall,
        ingredient_detail: values.ingredient_detail,
        time: values.time
      }
    }).then(data => {
      if (data.message) {
        if (data.message.ingredient_detail) {
          message.error('please give ingredient description\'s structure like -> ingredient:volume,ingredient:volume...')
          return
        }
      }
      message.success('recipe create');
      rid = data.recipe_id
      reciper(rid, formData)
    });
  };
  function reciper (rid, form) {
    fetch('http://127.0.0.1:5000/recipes/photo/' + rid, {
      method: 'POST',
      body: form,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
        processData: false
      },
    }).then(data => {
      message.success('picture upload');
      navigate('/');
    });
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  const { Option } = Select;
  const { TextArea } = Input;
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };
  const children = [];
  for (let i = 10; i < 36; i++) {
    children.push();
  }

  const tagChange = (value) => {
    console.log(`selected ${value}`);
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
  // eslint-disable-next-line prefer-const
  let token = ''
  return (
    <FullScreenContainer>
        <Form
        name="validate_other"
        style={{ width: 600 }}
        {...formItemLayout}
        initialValues={{
          'input-number': 3,
          'checkbox-group': ['A', 'B'],
          rate: 3.5,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        >
            <Form.Item label="">
            </Form.Item>
            <Form.Item
                name="recipe_name"
                label="Recipe Name"
                hasFeedback
                rules={[{ required: true, message: 'Enter a name for your recipe' }]}
            >
            <Input placeholder="Enter a name for your recipe">
            </Input>
            </Form.Item>

            <Form.Item
                name="meal_type"
                label="Meal type"
                rules={[{ required: true, message: 'Enter a type' }]}
            >
            <Select mode="multiple" placeholder="Enter a type">
                <Option value="Breakfast">Breakfast</Option>
                <Option value="Lunch">Lunch</Option>
                <Option value="Dinner">Dinner</Option>
                <Option value="Main">Main</Option>
                <Option value="Drink">Drink</Option>
                <Option value="Snack">Snack</Option>
            </Select>
            </Form.Item>
            <Form.Item
                name="main_ingredients"
                label="Main ingredients"
                rules={[{ required: true, message: 'Enter a type' }]}
            >
            <Select mode="multiple" placeholder="Enter a type">
                <Option value="Beef">Beef</Option>
                <Option value="Vegetables">Vegetables</Option>
                <Option value="Pasta">Pasta</Option>
                <Option value="Poultry">Poultry</Option>
                <Option value="Pork">Pork</Option>
                <Option value="Seafood">Seafood</Option>
            </Select>
            </Form.Item>
            <Form.Item
                name="ingredient_detail"
                label="ingredient description"
            >
                <TextArea rows={1} placeholder="like beef:50g,egg:50g" />
            </Form.Item>
            <Form.Item
                name="time"
                label="time"
                rules={[{ required: true, message: 'Enter a time' }]}
            >
            <Select placeholder="Enter a time">
                <Option value="Under 20 min">Under 20 min</Option>
                <Option value="Under 30 min">Under 30 min</Option>
                <Option value="Under 60 min">Under 60 min</Option>
                <Option value="Over 60 min">Over 60 min</Option>
            </Select>
            </Form.Item>
            <Form.Item
                name="method"
                label="Method"
                rules={[{ required: false, message: 'Enter a Method' }]}
            >
            <Select placeholder="Enter a Method">
                <Option value="American">American</Option>
                <Option value="British">British</Option>
                <Option value="Chinese">Chinese</Option>
                <Option value="Italian">Italian</Option>
                <Option value="Indian">Indian</Option>
                <Option value="French">French</Option>
                <Option value="other">other</Option>
            </Select>
            </Form.Item>
            <Form.Item
                name="description"
                label="Description"
            >
                <TextArea rows={5} placeholder="Describe your approach" />
            </Form.Item>
            <Form.Item
            label="UploadPic"
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
              // beforeUpload={() => false}
              beforeUpload={() => false}
            >
              {filelist.length >= 1 ? null : uploadButton}
            </Upload>
          </Form.Item>
            <Form.Item style={{ width: 300, margin: '0px 180px' }}>
              <Button type="primary" htmlType="submit" block>
                Submit
              </Button>
            </Form.Item>
        </Form>
    </FullScreenContainer>
  );
}
