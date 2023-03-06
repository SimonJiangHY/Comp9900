from flask import Flask
from flask_restx import Api
from config import Config
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    # create and configure the app
    app = Flask(__name__)
    app.config.from_object(config_class)
    # add config and database
    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    # define Api
    api = Api(
        title='9900-Brainstorm',
        version='1.0',
        description='backend Api Swagger',
        security="Bearer Auth",
        authorizations={
            "Bearer Auth": {
                "type": "apiKey",
                "in": "header",
                "name": "Authorization",
                "description": "Add a jwt with ** Bearer token"
            }
        }
    )
    # add apis
    # from .blog import api as ns2
    from .users import api as ns1
    from .token import api as ns2
    from .recipe import api as ns3
    from .follow import api as ns4
    from .comment import api as ns5
    from .like import api as ns6
    from .ranking import api as ns7
    from .searching import api as ns8
    from .recommend import api as ns9
    api.add_namespace(ns1)
    api.add_namespace(ns2)
    api.add_namespace(ns3)
    api.add_namespace(ns4)
    api.add_namespace(ns5)
    api.add_namespace(ns6)
    api.add_namespace(ns7)
    api.add_namespace(ns8)
    api.add_namespace(ns9)
    # ...
    api.init_app(app)

    return app


from apis import models

