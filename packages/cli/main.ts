import { main } from './src/index'
import { resolve } from 'path';

main(resolve(process.cwd(), 'package.js'))