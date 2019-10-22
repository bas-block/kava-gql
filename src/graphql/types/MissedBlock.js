export default `
  type MissedBlock {
    height: Int
    validators: [Validator]
    active_validators: Int
    total_validators: Int
  }

  type MissedBlockConnection {
    docs: [MissedBlock]!
    pageInfo: PageInfo!
  }
`;
