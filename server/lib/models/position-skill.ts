import { Schema, model, Types } from 'mongoose';
import { MongooseOpts } from './default-opts';
import { IPosition } from './position';
import { SkillImportance } from './enums/skill-importance.enum';

export interface IPositionSkill {
  _id?: Types.ObjectId,
  position: IPosition['_id'],
  code: string, // matches SkillOption.code
  minimumLevel: number, // same numeric scale as UserSkill.level
  importance: SkillImportance
}

const positionSkillSchema = new Schema<IPositionSkill>({
  position: { type: Schema.Types.ObjectId, required: true, ref: 'Position' },
  code: { type: String, required: true },
  minimumLevel: { type: Number, required: true },
  importance: { type: String, enum: SkillImportance, required: true }
}, MongooseOpts);

export const PositionSkillModel = model<IPositionSkill>('PositionSkill', positionSkillSchema);
