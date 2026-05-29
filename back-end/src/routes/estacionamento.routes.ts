import { Router } from 'express';
import * as c from '../controllers/estacionamento.controller';

const r = Router();

r.get('/tarifas',         c.getTarifas);
r.put('/tarifas',         c.updateTarifas);
r.get('/dashboard',       c.getDashboard);
r.get('/sessoes/todas',   c.getAllSessoes);

r.get('/veiculos',        c.getVeiculos);
r.post('/veiculos',       c.addVeiculo);
r.delete('/veiculos/:id', c.deleteVeiculo);

r.get('/sessao/ativa',    c.getSessaoAtiva);
r.post('/sessao/iniciar', c.iniciarSessao);
r.post('/sessao/:id/pagar', c.pagarSessao);
r.get('/sessoes',         c.getSessoes);

r.get('/plano',           c.getPlano);
r.post('/plano/assinar',  c.assinarPlano);

export default r;
