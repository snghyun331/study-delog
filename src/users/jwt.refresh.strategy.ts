import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
// import { Strategy } from 'passport-custom';
// import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
