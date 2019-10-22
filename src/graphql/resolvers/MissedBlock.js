import MissedBlock from "../../models/MissedBlockModel";

export default {
  Query: {
    allMissedBlocks: async (_, args) => {
      const query = {};
      const sort_by_height =
        args.sort.field === "height"
          ? {
              height: args.sort.direction
            }
          : {};

      const sort_by_moniker =
        args.sort.field === "moniker"
          ? {
              "description.moniker": args.sort.direction
            }
          : {};

      const results = await MissedBlock.paginate(query, {
        page: args.pagination.page,
        limit: args.pagination.limit,
        sort: sort_by_height,
        populate: [{ path: "validators", options: { sort: sort_by_moniker } }]
      });

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
