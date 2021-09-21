import 'regenerator-runtime';

import { main } from './index'
import { resolve } from 'path';

main(resolve(process.cwd(), 'project.js'))