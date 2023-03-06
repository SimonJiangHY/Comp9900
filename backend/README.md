## How to run backend system

### 1. cd "$your_path"\backend 

### 2. create virtual env （for the first time you run）

```
python -m venv venv
```

### 3. enter env

```
venv\Scripts\activate
```

### 4 install packages in requirements

```
pip install -r requirements.txt
```

### 5 migrate database

```
flask db upgrade
```

### 6 run backend

```
flask run
```

## Written for backend dev team member

### When you need to install new package

```
pip install 'your package'
pip freeze > requirements.txt    
```

### Database migrate(SQLite)

initial db (only first time )

```
flask db init
```

create migrate script

```
flask db migrate -m "your message"
```

do migrate

```
flask db upgrade
```

get back 

```
flask db downgrade
```