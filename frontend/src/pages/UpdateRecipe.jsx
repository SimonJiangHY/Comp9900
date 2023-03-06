/* eslint-disable multiline-ternary */
import React, { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Input, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { FullScreenContainer } from '../styled';
import useUser from '../hooks/useUser';
import request from '../utils/request';
import { getToken } from '../utils/index';

export default function UpdateRecipe () {
  const { recipeId } = useParams()
  const { getId } = useUser();
  const id = getId();
  const navigate = useNavigate();
  // eslint-disable-next-line prefer-const
  let ingredientall = ''
  let mealTypeall = ''
  const [filelist, setFilelist] = useState([]);
  const [testvalue, settestvalue] = useState('123')
  // eslint-disable-next-line prefer-const
  // eslint-disable-next-line prefer-const
  let rid = ''
  const [previewImage, setPreviewImage] = useState('')
  const [previewVisible, setPreviewVisible] = useState(false)
  // eslint-disable-next-line prefer-const
  let OriginRecipeName = ''
  // eslint-disable-next-line react/no-direct-mutation-state
  const handlePreview = (file) => {
    setPreviewImage(file.thumbUrl)
    setPreviewVisible(true)
  };
  const handleChange = ({ fileList: newFileList }) => {
    setFilelist(newFileList);
  };
  // interaction
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    // eslint-disable-next-line prefer-const
    let url = 'http://127.0.0.1:5000/recipes/' + recipeId
    fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token || getToken()}`,
        'Cache-Control': 'no-cache'
      },
    }).then(res => res.json())
      .then(data => {
        console.log(data)
        console.log(testvalue)
        OriginRecipeName = data
        settestvalue(data.recipe_name)
        setTimeout(() => {
          onFill()
        })
      });
  }, []);
  const onFill = () => {
    OriginRecipeName.main_ingredients = OriginRecipeName.main_ingredients.split(',')
    OriginRecipeName.meal_type = OriginRecipeName.meal_type.split(',')
    form.setFieldsValue({
      recipe_name: OriginRecipeName.recipe_name,
      meal_type: OriginRecipeName.meal_type,
      main_ingredients: OriginRecipeName.main_ingredients,
      ingredient_detail: OriginRecipeName.ingredient_detail,
      time: OriginRecipeName.time,
      method: OriginRecipeName.method,
      description: OriginRecipeName.description,
    })
  };
  const onFinish = (values) => {
    // const { fileList } = this.state;
    // eslint-disable-next-line prefer-const
    // down 2 lines are about image -----!!!!!!!!!!!!
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
    console.log('mealtype' + mealTypeall)
    // eslint-disable-next-line prefer-const
    let token = ''
    // console.log('Success:', values);
    request('/recipes/' + recipeId, {
      method: 'PATCH',
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
      message.success('recipe update');
      rid = recipeId
      navigate('/');
    });
  };
  // eslint-disable-next-line prefer-const
  let token = ''
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
      message.success('success');
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
  const [form] = Form.useForm();
  return (
    <FullScreenContainer>
        <Form
        form={form}
        name="validate_other"
        style={{ width: 600 }}
        {...formItemLayout}
        initialValues={{
          'input-number': 3,
          'checkbox-group': ['A', 'B'],
          rate: 3.5,
          recipe_name: testvalue,
          meal_type: ['breakfast'],
          ingredient: ['jkl', 'kql'],
          time: ['under 10 min'],
          method: 'jkl',
          description: 'jkl',
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        >
            <Form.Item>
            </Form.Item>
            <Form.Item
                name="recipe_name"
                label="Recipe Name"
                hasFeedback
            >
            <Input>
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
                <TextArea rows={5} placeholder="Describe your approach"/>
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
