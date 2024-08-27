import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Operator } from "./Operator"

@Entity()
export class Client {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    birthdate: Date

    @Column({ nullable: true, type: 'float' })
    value: number

    @Column({ nullable: true })
    email: string

    @Column({ nullable: true })
    operator_id: number

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(() => Operator, operator => operator.clients)
    @JoinColumn({ name: 'operator_id' })
    operator: Operator
}
