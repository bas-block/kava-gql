import MissedBlock from "../../models/MissedBlockModel";

export default {
  Query: {
    allMissedBlocks: async (_, args) => {
      const query = {};
      const results = await MissedBlock.paginate(query, {
        page: args.pagination.page,
        limit: args.pagination.limit
      });
      // const results = await Block.paginate(query, {
      //   page: args.pagination.page,
      //   limit: args.pagination.limit,
      //   sort: {
      //     [args.sort.field]: args.sort.direction
      //   }
      // });

      return {
        docs: results.docs,
        pageInfo: {
          total: results.total,
          limit: results.limit,
          page: results.page,
          pages: results.pages
        }
      };
    }
  }
};
