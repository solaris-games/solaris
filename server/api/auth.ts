import { Router } from 'express';
import ValidationError from '../errors/validation';
import { DependencyContainer } from '../types/DependencyContainer';
import Middleware from './middleware';
const axios = require('axios');

export default (router: Router, io, container: DependencyContainer) => {

    const middleware = Middleware(container);

    return router;

};
